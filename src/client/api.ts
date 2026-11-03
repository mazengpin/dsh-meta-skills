/**
 * dsh-meta-skills — the page's transport.
 *
 * EVERY REQUEST GOES THROUGH THE FUSED PREFIX. The page never calls a member's
 * own route directly: if it did, the fused entry could keep drawing a complete
 * picture while the fused routes were broken, and the parity claim would rest on
 * a path the user never used.
 *
 * A failure is an object, not an exception swallowed into an empty list — the
 * program's own rule. `read()` returns `{ok:false, error}` for a non-2xx or an
 * unparseable body, and the page renders that with the route's name, so "the
 * member refused" and "nothing to show" cannot look the same on screen.
 *
 * @module dsh-meta-skills/client/api
 */

import { CAPABILITIES_PATH, HEALTH_PATH, ROUTE_PREFIX } from '../shared/protocol.ts'
import type { CapabilitiesResponse, HealthResponse } from '../shared/protocol.ts'

/** One reading: either a parsed body or a stated failure. */
export type Reading<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string; readonly route: string; readonly status: number }

/** Bound on one request from the page, in ms. */
const TIMEOUT_MS = 20000

/** Read one response, refusing to coerce a failure into an empty value. */
async function read<T>(route: string, init: RequestInit): Promise<Reading<T>> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(route, { ...init, signal: controller.signal })
    const text = await response.text()
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}: ${text.slice(0, 400)}`, route, status: response.status }
    }
    try {
      return { ok: true, value: JSON.parse(text) as T }
    } catch {
      return { ok: false, error: `body is not JSON (${text.length} chars)`, route, status: response.status }
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error), route, status: 0 }
  } finally {
    clearTimeout(timer)
  }
}

/** The capability ledger, priced against the live deployment. */
export async function getCapabilities(): Promise<Reading<CapabilitiesResponse>> {
  return await read<CapabilitiesResponse>(`${ROUTE_PREFIX}${CAPABILITIES_PATH}`, { method: 'GET' })
}

/** One liveness probe per member. */
export async function getHealth(): Promise<Reading<HealthResponse>> {
  return await read<HealthResponse>(`${ROUTE_PREFIX}${HEALTH_PATH}`, { method: 'GET' })
}

/**
 * Drive one method of the skills channel through the fused prefix.
 *
 * The envelope is the member's own shape (`plugin.mjs:2252-2263`):
 * `{ type: 'client-request', rpcId, method, payload: { args } }`, and the method
 * is ALSO the last path segment, because that is how the member reads it
 * (`plugin.mjs:2163-2176`). Both are sent because the member requires them to
 * agree, and choosing only one would produce a 400 that looks like a wiring bug.
 */
export async function postSkill(endpoint: string, args: Record<string, unknown> = {}): Promise<Reading<unknown>> {
  const rpcId = `meta-skills-${Date.now().toString(36)}`
  return await read<unknown>(`${ROUTE_PREFIX}/api/skills/${endpoint}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'client-request', rpcId, method: endpoint, payload: { args } }),
  })
}

/** Read one route under a fused JSON family (`/api/tools/...`, `/api/recall/...`, `/api/pipeline/...`, `/api/studio/...`). */
export async function getFamily(family: 'tools' | 'recall' | 'pipeline' | 'studio', tail: string): Promise<Reading<unknown>> {
  return await read<unknown>(`${ROUTE_PREFIX}/api/${family}/${tail}`, { method: 'GET' })
}
