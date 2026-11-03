/**
 * ============================================================================
 * dsh-meta-skills — the forwarder: composition, not a re-implementation
 * ============================================================================
 *
 * WHAT THIS FILE IS FOR. `D-0352` says a fused plugin must preserve every
 * member's capability, and this program's rule is that facts have exactly one
 * home. The members' behaviour already exists, is already tested (92 of 92
 * assertions in `dsh-skill-evolution`'s own suite), and is owned by code this
 * decision explicitly forbids me to modify. So the fused surface COMPOSES: a
 * request to `/meta-skills/api/<family>/<rest>` is forwarded, byte for byte, to
 * the member's own prefix, and the member's own handler answers.
 *
 * WHY THAT IS THE HONEST CHOICE RATHER THAN THE LAZY ONE. A copy of three
 * handlers would (i) be untested behaviour the moment the members change, (ii)
 * duplicate the absent-value discipline each member already implements
 * separately (each file's own "an absent value is not a zero" block), and (iii)
 * turn every future member fix into an unapplied fix. Composition is
 * byte-faithful BY CONSTRUCTION, which is the property the parity harness then
 * measures instead of assuming.
 *
 * WHAT IS *NOT* FORWARDED, AND WHY. Hop-by-hop headers are dropped (`host`,
 * `content-length`, `connection`, `keep-alive`, `transfer-encoding`,
 * `upgrade`, `expect`, `proxy-*`) because the forwarded request is a NEW
 * request: keeping `host` would name the wrong authority, and keeping a stale
 * `content-length` would describe a body this process re-framed. The `cookie`
 * header IS forwarded, deliberately: `dsh-skill-evolution`'s channel runs
 * `ctx.connection.admit(req)` BEFORE it looks at the method, so a forward that
 * dropped credentials would turn an authorised user's click into a 401 and the
 * fused surface would look broken for a reason that is entirely mine.
 *
 * @module dsh-meta-skills/host/proxy
 */

import type { IncomingMessage } from 'node:http'

/** The subset of a response this surface needs in order to reproduce one. */
export interface ForwardedResponse {
  readonly status: number
  readonly body: Buffer
  readonly contentType: string | null
}

/** Raised when the member could not be reached at all. Distinct from "it refused". */
export class UpstreamUnreachable extends Error {
  /** The upstream URL this process tried to reach. */
  readonly target: string
  constructor(target: string, cause: unknown) {
    super(`upstream ${target} could not be reached: ${cause instanceof Error ? cause.message : String(cause)}`)
    this.name = 'UpstreamUnreachable'
    this.target = target
  }
}

/**
 * Headers a new request must not inherit.
 *
 * `content-length` is in the list even though it is not hop-by-hop in the RFC
 * sense: `fetch` sets it from the body it is given, and a copied value would
 * either be stale or make the body look truncated.
 */
const DROPPED_HEADERS = new Set([
  'host', 'content-length', 'connection', 'keep-alive', 'transfer-encoding',
  'upgrade', 'expect', 'te', 'trailer', 'proxy-authorization', 'proxy-connection',
])

/** Read the whole request body into one buffer, bounded by nothing but the member's own cap. */
export async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array))
  return Buffer.concat(chunks)
}

/** Copy the request's headers into a forwardable record. */
export function forwardableHeaders(req: IncomingMessage): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined) continue
    if (DROPPED_HEADERS.has(name.toLowerCase())) continue
    out[name] = Array.isArray(value) ? value.join(', ') : value
  }
  return out
}

/**
 * Derive the origin to forward to.
 *
 * FROM THE REQUEST'S OWN `Host` HEADER, so the fused surface talks to the same
 * deployment the browser did. This is a DERIVATION, not a hard-coded port: no
 * absolute machine path enters a committed artifact, and a profile served on a
 * different loopback port needs no edit here.
 *
 * @param req - the incoming request (its `Host` header is the authority).
 * @param override - an explicit base, from config or the environment.
 * @returns the origin, with no trailing slash.
 */
export function resolveOrigin(req: IncomingMessage, override?: string): string {
  if (override !== undefined && override !== '') return override.replace(/\/+$/, '')
  const host = req.headers.host
  if (host === undefined || host === '') {
    throw new UpstreamUnreachable('(no Host header)', 'a request with no Host header cannot name the deployment to forward to')
  }
  return `http://${host}`
}

/**
 * Forward one request to one upstream path and return its answer verbatim.
 *
 * @param req - the incoming request.
 * @param target - the absolute upstream URL.
 * @param body - the already-read request body (empty for GET/HEAD).
 * @param timeoutMs - bound on the whole exchange.
 * @returns the member's status, body and content type, unchanged.
 */
export async function forward(
  req: IncomingMessage,
  target: string,
  body: Buffer,
  timeoutMs: number,
): Promise<ForwardedResponse> {
  const method = (req.method ?? 'GET').toUpperCase()
  const headers = forwardableHeaders(req)
  let response: Response
  try {
    response = await fetch(target, {
      method,
      headers,
      body: method === 'GET' || method === 'HEAD' || body.length === 0 ? undefined : new Uint8Array(body),
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (error) {
    throw new UpstreamUnreachable(target, error)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  return { status: response.status, body: buffer, contentType: response.headers.get('content-type') }
}
