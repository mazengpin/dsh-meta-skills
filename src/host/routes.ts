/**
 * ============================================================================
 * dsh-meta-skills — the ONE prefix, its dispatcher, and its own 404
 * ============================================================================
 *
 * THE ROUTE TABLE, IN FULL. Everything this plugin serves lives under
 * `ROUTE_PREFIX` and nowhere else:
 *
 * | path                                | verb      | what                                   |
 * |-------------------------------------|-----------|----------------------------------------|
 * | `/meta-skills/api/capabilities`     | GET       | the capability ledger + live member status |
 * | `/meta-skills/api/health`           | GET       | one probe per member, with its clock    |
 * | `/meta-skills/api/skills/<method>`  | POST      | forwarded to `/skill-evolution/<method>` |
 * | `/meta-skills/api/tools/<rest>`     | as sent   | forwarded to `/tools-skills-evolve/api/<rest>` |
 * | `/meta-skills/api/recall/<rest>`    | as sent   | forwarded to `/recall-console/api/<rest>` |
 * | `/meta-skills/api/pipeline/<rest>`  | as sent   | forwarded to `/evolution/api/<rest>`    |
 * | `/meta-skills/api/studio/<rest>`    | as sent   | forwarded to `/skill-studio/api/<rest>` |
 *
 * THE 404 BODY IS THIS PLUGIN'S OWN, AND THAT IS AN ACCEPTANCE CRITERION, NOT A
 * DETAIL. An advertised path that 404s is worse than an absent one, because the
 * 404 body is the one place whose job is to be authoritative; so an unknown path
 * here answers with {@link NotFoundResponse} — `fused: 'dsh-meta-skills'`, the
 * path as received, and a pointer to the route that explains the surface — and
 * never with a member's body, which would attribute this plugin's miss to
 * somebody else's prefix.
 *
 * THE ENDPOINT SEGMENT IS VALIDATED BEFORE IT IS FORWARDED. `dsh-skill-evolution`
 * rejects `''`, `.` and `..` itself (`plugin.mjs:2170-2174`), but a forwarder that
 * relies on its upstream's validation would build a URL out of unvalidated input
 * and let `..` walk the prefix. The check is here so the surface is correct on
 * its own.
 *
 * @module dsh-meta-skills/host/routes
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  CAPABILITIES_PATH,
  HEALTH_PATH,
  ROUTE_PREFIX,
  type HealthResponse,
  type NotFoundResponse,
} from '../shared/protocol.ts'
import { CAPABILITIES, FAMILIES, ROUTE_METHODS, ROUTE_PATHS } from '../shared/protocol.ts'
import type { Family } from '../shared/protocol.ts'
import { buildCapabilities, probeMembers } from './capabilities.ts'
import { runEngineRoute, type EngineRoute } from './engine.ts'
import { forward, readBody, resolveOrigin, UpstreamUnreachable } from './proxy.ts'
import type { MetaSkillsConfig } from './types.ts'

/** Write one JSON body, with the content type every route here uses. */
export function writeJson(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(text),
    'cache-control': 'no-store',
  })
  res.end(text)
}

/** Write this plugin's own 404 body. */
function writeNotFound(res: ServerResponse, pathname: string): void {
  const body: NotFoundResponse = {
    ok: false,
    fused: 'dsh-meta-skills',
    error: 'unknown meta-skills route',
    path: pathname,
    prefix: ROUTE_PREFIX,
    see: `${ROUTE_PREFIX}${CAPABILITIES_PATH}`,
  }
  writeJson(res, 404, body)
}

/** A segment the skill channel's own pattern would accept, so `..` cannot walk out. */
const ENDPOINT_PATTERN = /^[A-Za-z][A-Za-z0-9/._-]*$/

/**
 * Build the prefix handler.
 *
 * @param config - the plugin's configuration (upstream overrides, timeouts).
 * @returns a handler for `ctx.webServer.register({ kind: 'prefix' })`.
 */
export function createRouteHandler(config: MetaSkillsConfig): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  return async (req, res): Promise<void> => {
    const url = new URL(req.url ?? '/', 'http://dsh.invalid')
    const pathname = url.pathname
    // Guard the prefix BEFORE slicing. A handler must not depend on its router for
    // its own correctness: a foreign pathname whose tail happens to match would
    // otherwise resolve.
    if (!pathname.startsWith(ROUTE_PREFIX)) {
      writeNotFound(res, pathname)
      return
    }
    const rest = pathname.slice(ROUTE_PREFIX.length) || '/'
    const method = (req.method ?? 'GET').toUpperCase()

    try {
      // ------------------------------------------------------------ the ledger
      if (rest === CAPABILITIES_PATH) {
        if (method !== 'GET') {
          writeJson(res, 405, { ok: false, fused: 'dsh-meta-skills', error: 'method not allowed', route: `${ROUTE_PREFIX}${CAPABILITIES_PATH}`, received: method })
          return
        }
        const members = await probeMembers(req, config)
        writeJson(res, 200, buildCapabilities(members))
        return
      }

      // ------------------------------------------------------------ liveness
      if (rest === HEALTH_PATH) {
        if (method !== 'GET') {
          writeJson(res, 405, { ok: false, fused: 'dsh-meta-skills', error: 'method not allowed', route: `${ROUTE_PREFIX}${HEALTH_PATH}`, received: method })
          return
        }
        const members = await probeMembers(req, config)
        const answered = members.filter(member => member.reachable === true).length
        const body: HealthResponse = {
          ok: true,
          fused: 'dsh-meta-skills',
          prefix: ROUTE_PREFIX,
          censusAt: new Date().toISOString(),
          members,
          answered: { count: answered, probed: members.length },
        }
        writeJson(res, 200, body)
        return
      }

      // ------------------------------------------------------------ skills (envelope channel)
      // ---- the dispatch table: a path that is not in ROUTE_PATHS is not served,
      // so the surface can never advertise a route it does not answer.
      const declared = typeof rest === 'string' ? Object.entries(ROUTE_PATHS).find(([, path]) => path === rest) : undefined
      if (rest !== '/api/capabilities' && rest !== '/api/health' && declared === undefined) {
        writeNotFound(res, pathname)
        return
      }

      // ------------------------------------------------------------ engine (IN PROCESS, not forwarded)
      // THESE FOUR ROUTES ARE DRIVEN, NOT FORWARDED. The handler calls the engine's own
      // exported entry points through `src/host/engine.ts`, so the fused surface answers
      // from the engine itself rather than describing it. The verb is enforced from
      // ROUTE_METHODS exactly as for the forwarding families, and the driver's refusal
      // kinds map to their own statuses: a missing engine reads as 503 WITH A REASON,
      // never as a 200 with a zero in it.
      if (declared !== undefined && declared[1].startsWith(`${FAMILIES.engine.fusedBase}/`)) {
        const expected = ROUTE_METHODS[declared[0] as keyof typeof ROUTE_METHODS]
        if (method !== expected) {
          writeJson(res, 405, { ok: false, fused: 'dsh-meta-skills', error: 'method not allowed', route: `${ROUTE_PREFIX}${declared[1]}`, received: method, declared: expected })
          return
        }
        let input: unknown = {}
        if (method === 'POST') {
          const raw = await readBody(req)
          const text = raw.toString('utf8').trim()
          if (text !== '') {
            try {
              input = JSON.parse(text)
            } catch {
              writeJson(res, 400, { ok: false, fused: 'dsh-meta-skills', error: 'body is not JSON', route: `${ROUTE_PREFIX}${declared[1]}` })
              return
            }
          }
        }
        const answer = await runEngineRoute(declared[0] as EngineRoute, input)
        writeJson(res, answer.status, answer.body)
        return
      }
      if (declared !== undefined && declared[1].startsWith(`${FAMILIES.skills.fusedBase}/`)) {
        // the tail comes from the DECLARED PATH, not from the key: a member's
        // dispatch name and its path segment are not always the same string
        // (`metaControl` is served at `/api/meta/control`).
        const endpoint = declared[1].slice(FAMILIES.skills.fusedBase.length + 1)
        if (!ENDPOINT_PATTERN.test(endpoint)) {
          writeJson(res, 400, { ok: false, fused: 'dsh-meta-skills', error: 'bad endpoint segment', endpoint, see: `${ROUTE_PREFIX}${CAPABILITIES_PATH}` })
          return
        }
        if (method !== 'POST') {
          // The member answers 404 here (it treats a non-POST as "not found"); the
          // fused surface answers 405, because the method IS wrong and saying so is
          // more useful than pretending the route does not exist.
          writeJson(res, 405, { ok: false, fused: 'dsh-meta-skills', error: 'method not allowed', route: `${ROUTE_PREFIX}${FAMILIES.skills.fusedBase}/${endpoint}`, received: method, hint: 'the skill channel is POST with an RPC envelope' })
          return
        }
        const body = await readBody(req)
        const origin = baseFor(config, 'skills', req)
        const target = `${origin}${FAMILIES.skills.upstreamBase}/${endpoint}${url.search}`
        const answer = await forward(req, target, body, config.timeoutMs ?? 15000)
        writeForwarded(res, answer.status, answer.body, answer.contentType)
        return
      }

      // ------------------------------------------------------------ tools + pipeline (JSON routes)
      // `studio` is the FIFTH family (D-0357) and joins this loop rather than
      // getting a branch of its own: like the two consoles it is a JSON surface with
      // one declared verb per path, so the loop's verb enforcement applies unchanged.
      for (const family of ['tools', 'recall', 'pipeline', 'studio'] as const) {
        const fusedBase = FAMILIES[family].fusedBase
        // A declared fused path may BE the family base rather than sit under it:
        // `toolView` is served at `/api/tools`, and a prefix-only test sends it past
        // every branch to a 404 that names the path as unknown even though the
        // ledger declares it. So equality is accepted, and the tail is empty.
        if (declared === undefined || (declared[1] !== fusedBase && !declared[1].startsWith(`${fusedBase}/`))) continue
        const tail = declared[1] === fusedBase ? '' : declared[1].slice(fusedBase.length + 1)
        // The declared verb is ENFORCED. The member is never asked a question its
        // own guard would refuse, and the 405 here is this plugin's own answer
        // rather than the member's, so a wrong method reads as a wrong method.
        const expected = ROUTE_METHODS[declared[0] as keyof typeof ROUTE_METHODS]
        if (method !== expected) {
          writeJson(res, 405, { ok: false, fused: 'dsh-meta-skills', error: 'method not allowed', route: `${ROUTE_PREFIX}${declared[1]}`, received: method, declared: expected, see: `${ROUTE_PREFIX}${CAPABILITIES_PATH}` })
          return
        }
        const origin = baseFor(config, family, req)
        // The member path comes from the LEDGER, not from the fused tail: the two
        // differ whenever a member names a route differently from its fused entry
        // (`/api/tools/control` is `/tools-skills-evolve/api/tools/control`, and the
        // tail alone would build `/api/control` — a route the member does not serve,
        // which the parity harness caught as a marker mismatch, not as a 404).
        const ledgerRow = CAPABILITIES.find((row: (typeof CAPABILITIES)[number]) => row.kind === 'route' && row.fusedPath === declared[1])
        const memberPath = ledgerRow?.upstreamPath ?? `${FAMILIES[family].upstreamBase}/${tail}`
        const target = `${origin}${memberPath}${url.search}`
        const body = method === 'GET' ? Buffer.alloc(0) : await readBody(req)
        const answer = await forward(req, target, body, config.timeoutMs ?? 15000)
        writeForwarded(res, answer.status, answer.body, answer.contentType)
        return
      }

      // ------------------------------------------------------------ anything else
      writeNotFound(res, pathname)
    } catch (error) {
      if (error instanceof UpstreamUnreachable) {
        // 502, not 200: "the member could not be reached" is a failure of THIS
        // request, and the body names the target so the reader can see which
        // member is missing rather than guessing from a blank panel.
        writeJson(res, 502, {
          ok: false,
          fused: 'dsh-meta-skills',
          error: 'upstream member unreachable',
          target: error.target,
          reason: error.message,
          see: `${ROUTE_PREFIX}${HEALTH_PATH}`,
        })
        return
      }
      writeJson(res, 500, {
        ok: false,
        fused: 'dsh-meta-skills',
        error: 'meta-skills internal error',
        reason: error instanceof Error ? error.message : String(error),
      })
    }
  }
}

/** Reproduce one forwarded response verbatim. */
function writeForwarded(res: ServerResponse, status: number, body: Buffer, contentType: string | null): void {
  res.writeHead(status, {
    'content-type': contentType ?? 'application/json; charset=utf-8',
    'content-length': body.length,
    'cache-control': 'no-store',
  })
  res.end(body)
}

/** The origin one family forwards to, honouring the config's overrides. */
function baseFor(config: MetaSkillsConfig, family: Family, req: IncomingMessage): string {
  return resolveOrigin(req, config.familyBases?.[family] ?? config.upstreamBase)
}
