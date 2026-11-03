/**
 * ============================================================================
 * dsh-meta-skills — Host half
 * ============================================================================
 *
 * THE FUSED SURFACE (`D-0352`): the skills / tools evolution family behind ONE
 * route prefix and ONE sidebar entry, composed rather than copied.
 *
 * WHAT THIS HALF OWNS. A single prefix registration — `ctx.webServer.register({
 * kind: 'prefix', path: '/meta-skills' })` — and three things behind it: the
 * capability ledger, the member liveness probes, and a byte-faithful forward into
 * each member's own prefix. It owns no skill, no gate and no console state; there
 * is exactly one writer for each of those, and it is not this package.
 *
 * WHAT IT DELIBERATELY DOES NOT DO.
 *
 *  - **It does not modify, disable or unregister any member.** `D-0352` rules 1
 *    and 3: the members stay LOADED while the fusion is proven, and this package
 *    has no code path that could stop them.
 *  - **It does not re-implement a member's grading, mining or promotion.** Those
 *    behaviours are the members' own, already tested there, and a second copy
 *    would be untested behaviour the moment a member changed.
 *  - **It publishes no number it did not derive.** Every count it serves comes
 *    from `buildCapabilities`, which folds the ledger over probes taken in the
 *    same request and throws if the parts do not close to the whole.
 *
 * @module dsh-meta-skills/host
 */

import { ROUTE_PREFIX } from '../shared/protocol.ts'
import { createRouteHandler } from './routes.ts'
import type { HostContext, MetaSkillsConfig } from './types.ts'

/**
 * The ledger is re-exported from the SHIPPED artifact, on purpose.
 *
 * `verify/parity.mjs` imports `CAPABILITIES` from `lib/index.js` rather than from
 * `src/`, so the harness prices the artifact a profile actually loads. A harness
 * that read the TypeScript would pass over a build that exported nothing.
 */
export { CAPABILITIES, CENSUS_ADOPTION, CONSIDERED_NOT_FUSED, EXCLUDED_MEMBERS, FAMILIES, FUSED_BEYOND_CENSUS, ROUTE_METHODS, ROUTE_PATHS, ROUTE_PREFIX, CAPABILITIES_PATH, HEALTH_PATH } from '../shared/protocol.ts'

/**
 * The ENGINE DRIVER is re-exported for the same reason the ledger is: the harness
 * prices the artifact a profile loads. `verify/engine.mjs` calls these driver
 * functions directly, so a build that exported nothing would fail there rather
 * than pass over a description of a driver that was never compiled.
 */
export {
  ENGINE_MEMBER,
  ENGINE_OPERATIONS,
  engineRoot,
  enginePromote,
  engineRecall,
  engineSelect,
  engineStoreCensus,
  runEngineRoute,
} from './engine.ts'
export type { EngineFile, EngineHttpAnswer, EngineOperation, EngineOptions, EngineRefusal, EngineResult, EngineRoute, RefusalKind } from './engine.ts'

/** Loader row name; the bundle patch's `insert` mounts this same name. */
export const name = 'dsh-meta-skills'

/** The one service this plugin cannot work without. */
export const inject = ['webServer']

/**
 * Mount the fused surface.
 *
 * @param ctx - the Host plugin context (`webServer`, `effect`, `logger`).
 * @param config - optional upstream overrides; a deployment needs none, because the
 *   upstream origin is derived from each request's own `Host` header.
 */
export function apply(ctx: HostContext, config?: MetaSkillsConfig): void {
  const handler = createRouteHandler(config ?? {})
  ctx.effect(
    () => ctx.webServer.register({ kind: 'prefix', path: ROUTE_PREFIX, handler }),
    'dsh-meta-skills: fused family routes',
  )
  ctx.logger.info(
    `dsh-meta-skills: fused surface mounted at ${ROUTE_PREFIX} (families: ${Object.values(FAMILIES_QUOTED).join(', ')})`,
  )
}

/**
 * The four member prefixes this surface composes, quoted for the boot log.
 *
 * They are the members' SHIPPED constants — `plugin.mjs:69`,
 * `src/shared/protocol.ts:25` and `src/shared/protocol.ts:36` — and the parity
 * harness re-reads them from the members' source, so a drifting prefix fails the
 * gate rather than silently 404ing behind a fused path that still looks fine.
 */
const FAMILIES_QUOTED = {
  skills: '/skill-evolution',
  tools: '/tools-skills-evolve/api',
  recall: '/recall-console/api',
  pipeline: '/evolution/api',
  studio: '/skill-studio/api',
  engine: '(in process — no upstream prefix, the driver calls the engine modules directly)',
} as const
