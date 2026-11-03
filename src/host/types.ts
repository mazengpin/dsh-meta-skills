/**
 * ============================================================================
 * dsh-meta-skills — the Host surfaces, declared STRUCTURALLY
 * ============================================================================
 *
 * No `@deepseek-ai/*` import anywhere in this package, for the reason every
 * sibling clone states: a cross-package value import is a load-order dependency
 * in somebody else's boot, and this plugin needs two members of the Host context.
 *
 * @module dsh-meta-skills/host/types
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Family } from '../shared/protocol.ts'

/** The unregister function a successful registration returns. */
export type RouteRegistrar = () => void

/** The slice of the Host context this plugin reads. */
export interface HostContext {
  readonly webServer: {
    register(route: {
      readonly kind: 'prefix'
      readonly path: string
      readonly handler: (req: IncomingMessage, res: ServerResponse) => Promise<void> | void
    }): RouteRegistrar
  }
  effect(callback: () => RouteRegistrar | void, label?: string): void
  readonly logger: {
    info(...args: unknown[]): void
    warn(...args: unknown[]): void
  }
}

/**
 * This plugin's own configuration.
 *
 * THERE IS NO DEFAULT PORT AND NO DEFAULT HOST. The upstream address is DERIVED
 * from the incoming request's own `Host` header, so the fused surface forwards to
 * whichever loopback port the client already reached — no absolute machine path
 * in a committed artifact, and no `3083` hard-coded where a deployment could
 * change it. `upstreamBase` exists so a test can point the same code at a
 * loopback fake without a source edit.
 */
export interface MetaSkillsConfig {
  /** Override the derived upstream origin, e.g. `http://127.0.0.1:3999` in a harness. */
  upstreamBase?: string
  /** Bound on one forwarded request, in ms. */
  timeoutMs?: number
  /**
   * Per-family upstream bases, for a harness that stands a standalone fake per
   * member. Absent in a deployment, where one origin serves all three.
   */
  familyBases?: Partial<Record<Family, string>>
}
