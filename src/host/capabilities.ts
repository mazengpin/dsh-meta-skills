/**
 * ============================================================================
 * dsh-meta-skills — the capability ledger, priced against the live deployment
 * ============================================================================
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE (`D-0352` rule 4). A fused surface may
 * publish a number only if it can DERIVE it. So a capability is `present` only
 * when its member answered a probe TAKEN AT THIS REQUEST; a member that did not
 * answer yields `unmeasured` WITH THE REASON, never a cheerful zero and never a
 * silent absence. The distinction is the one this program has paid for three
 * times: "absent" and "zero" are different facts, and a surface that renders
 * them identically cannot be audited.
 *
 * WHY THE PROBE PATHS ARE PER-MEMBER RATHER THAN ONE UNIFORM RULE. `dsh-skill
 * -evolution`'s channel answers **404 for an unmatched endpoint OR a non-POST
 * method** (`plugin.mjs:2218-2221`, copied byte-for-byte from the harness's
 * rpc-host), which means a bare GET on its prefix cannot distinguish "mounted and
 * refusing" from "not mounted at all". Its probe is therefore a well-formed
 * `gateStats` envelope — a read-only census — and the rule is `status !== 404`,
 * because the fence answers 401/403 and a valid endpoint answers 200.
 *
 * @module dsh-meta-skills/host/capabilities
 */

import {
  CAPABILITIES,
  EXCLUDED_MEMBERS,
  ROUTE_PREFIX,
  type CapabilityReport,
  type CapabilitiesResponse,
  type Family,
  type MemberHealth,
} from '../shared/protocol.ts'
import { FAMILIES } from '../shared/protocol.ts'
import type { MetaSkillsConfig } from './types.ts'
import type { IncomingMessage } from 'node:http'
import { forwardableHeaders, resolveOrigin } from './proxy.ts'

/**
 * One member's liveness probe.
 *
 * `mountedWhen` is the predicate that reads the observed status, stated per member
 * instead of assumed, because the members do not share a refusal vocabulary:
 * the gate and the console 404 an unknown path, the skill channel 404s two
 * different things.
 */
interface Probe {
  readonly member: string
  readonly family: Family
  readonly method: 'GET' | 'POST'
  readonly path: string
  readonly body: string | null
  /** The member's own path that makes this probe meaningful, for the record. */
  readonly why: string
}

const PROBES: readonly Probe[] = [
  {
    member: FAMILIES.skills.member,
    family: 'skills',
    method: 'POST',
    path: `${FAMILIES.skills.upstreamBase}/gateStats`,
    body: JSON.stringify({ type: 'client-request', rpcId: 'meta-skills-probe', method: 'gateStats', payload: { args: {} } }),
    why: 'plugin.mjs:1965 (`case \'gateStats\'`) — a read-only census; the channel 404s both an unknown endpoint and a non-POST, so a GET cannot tell "refused" from "absent"',
  },
  {
    member: FAMILIES.tools.member,
    family: 'tools',
    method: 'GET',
    path: `${FAMILIES.tools.upstreamBase}/state`,
    body: null,
    why: 'src/host/routes.ts:218 (`ROUTE_PATHS.state`) — an unknown path is the only 404 this member has',
  },
  {
    member: FAMILIES.recall.member,
    family: 'recall',
    method: 'GET',
    path: `${FAMILIES.recall.upstreamBase}/status`,
    body: null,
    why: "src/host/routes.ts:215 (`route === 'status'`) — a read-only posture census; every recall route sits behind the same prefix, so a 404 here means the member is not mounted",
  },
  {
    member: FAMILIES.pipeline.member,
    family: 'pipeline',
    method: 'GET',
    path: `${FAMILIES.pipeline.upstreamBase}/catalog`,
    body: null,
    why: 'src/host/routes.ts:183 (`route === \'catalog\'`) — an unknown path is the only 404 this member has',
  },
  {
    member: FAMILIES.studio.member,
    family: 'studio',
    method: 'GET',
    path: `${FAMILIES.studio.upstreamBase}/state`,
    body: null,
    why: 'src/host/routes.ts:476 (`path === ROUTE_PATHS[0]`; `STATE_PATH = ROUTE_PATHS[0]` at :107) — read-only and writes nothing, and the only 404 this member has is its own final sendJson, so a 404 here means the prefix is not mounted',
  },
]

/** The origin one family forwards to. */
function baseFor(config: MetaSkillsConfig, family: Family, req: IncomingMessage): string {
  const override = config.familyBases?.[family] ?? config.upstreamBase
  return resolveOrigin(req, override)
}

/**
 * Probe every member once, at this request.
 *
 * @param req - the incoming request, used for the origin AND for its cookie.
 * @param config - the plugin's configuration.
 * @returns one health row per member, in `PROBES` order.
 */
export async function probeMembers(req: IncomingMessage, config: MetaSkillsConfig): Promise<MemberHealth[]> {
  const observedAt = new Date().toISOString()
  const timeoutMs = config.timeoutMs ?? 8000
  return await Promise.all(PROBES.map(async probe => {
    let target: string
    try {
      target = `${baseFor(config, probe.family, req)}${probe.path}`
    } catch (error) {
      return {
        member: probe.member,
        prefix: probe.path,
        reachable: null,
        probe: `${probe.method} ${probe.path}`,
        observedStatus: null,
        reason: `no reading: ${error instanceof Error ? error.message : String(error)} (${probe.why})`,
        observedAt,
      }
    }
    try {
      const response = await fetch(target, {
        method: probe.method,
        headers: { ...forwardableHeaders(req), 'content-type': 'application/json' },
        body: probe.body === null ? undefined : probe.body,
        redirect: 'manual',
        signal: AbortSignal.timeout(timeoutMs),
      })
      // Read the body so the connection is released; the CONTENT is not used.
      await response.arrayBuffer()
      const reachable = response.status !== 404
      return {
        member: probe.member,
        prefix: probe.path,
        reachable,
        probe: `${probe.method} ${probe.path}`,
        observedStatus: response.status,
        reason: reachable
          ? null
          : `probe answered 404, which for ${probe.member} means the prefix is not mounted at this origin (${probe.why})`,
        observedAt,
      }
    } catch (error) {
      return {
        member: probe.member,
        prefix: probe.path,
        reachable: null,
        probe: `${probe.method} ${probe.path}`,
        observedStatus: null,
        reason: `no reading: ${error instanceof Error ? error.message : String(error)} (${probe.why})`,
        observedAt,
      }
    }
  }))
}

/**
 * Fold the ledger and the probes into the wire report.
 *
 * The `counts` block is derived from the SAME array it describes, and the three
 * totals are asserted to close (`present + unmeasured === total`) before the
 * payload is written: a count that cannot be reconstructed by its reader is this
 * program's most-repeated published defect.
 *
 * @param members - the health rows from {@link probeMembers}.
 * @returns the response body for `/meta-skills/api/capabilities`.
 */
export function buildCapabilities(members: readonly MemberHealth[]): CapabilitiesResponse {
  const health = new Map(members.map(member => [member.member, member]))
  const capabilities: CapabilityReport[] = CAPABILITIES.map(capability => {
    const base = {
      id: capability.id,
      family: capability.family,
      member: capability.member,
      kind: capability.kind,
      verb: capability.verb,
      fusedPath: capability.fusedPath === null ? null : `${ROUTE_PREFIX}${capability.fusedPath}`,
      upstreamPath: capability.upstreamPath,
      citation: capability.citation,
      what: capability.what,
    }
    if (capability.unmeasuredReason !== null) {
      return { ...base, status: 'unmeasured' as const, reason: capability.unmeasuredReason }
    }
    const member = health.get(capability.member)
    if (member === undefined) {
      return { ...base, status: 'unmeasured' as const, reason: 'no probe was taken for this member at this request' }
    }
    if (member.reachable !== true) {
      return {
        ...base,
        status: 'unmeasured' as const,
        reason: member.reason ?? `member ${capability.member} did not answer a probe at ${member.observedAt}`,
      }
    }
    return { ...base, status: 'present' as const }
  })

  const present = capabilities.filter(capability => capability.status === 'present').length
  const unmeasured = capabilities.filter(capability => capability.status === 'unmeasured').length
  if (present + unmeasured !== capabilities.length) {
    // Structural, not cosmetic: a report whose parts do not sum to its whole is
    // worse than no report, so this throws rather than publishing a wrong total.
    throw new Error(`meta-skills capability census does not close: ${present} present + ${unmeasured} unmeasured != ${capabilities.length} total`)
  }
  return {
    ok: true,
    fused: 'dsh-meta-skills',
    prefix: ROUTE_PREFIX,
    censusAt: new Date().toISOString(),
    capabilities,
    counts: {
      total: capabilities.length,
      present,
      unmeasured,
      byKind: {
        route: capabilities.filter(capability => capability.kind === 'route').length,
        seat: capabilities.filter(capability => capability.kind === 'seat').length,
        inProcess: capabilities.filter(capability => capability.kind === 'in-process').length,
      },
    },
    excluded: EXCLUDED_MEMBERS,
    members,
  }
}
