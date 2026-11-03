/**
 * ============================================================================
 * dsh-meta-skills — the shared protocol AND the capability ledger
 * ============================================================================
 *
 * ONE PREFIX, ONE ENTRY, ONE DECLARED LEDGER. This package is the fused surface
 * for the skills / tools evolution family (`D-0352`): it presents its members
 * behind `/meta-skills` and one sidebar entry, and it publishes the capability
 * ledger below so that "the family is still reachable" is a MEASUREMENT rather
 * than a claim. The population is NOT stated in this comment: it is served at
 * `/meta-skills/api/capabilities`, counted from {@link CAPABILITIES} at request
 * time, because a number typed into a comment goes stale exactly as this file's
 * own earlier "THIRTY" did.
 *
 * WHY THE LEDGER LIVES IN THE PROTOCOL AND NOT IN THE HOST. The parity harness
 * (`verify/parity.mjs`) and the running route must agree about what the family
 * IS. Two copies of that list would let the harness pass over a capability the
 * route never serves, which is this program's most expensive recorded defect
 * shape (a count that cannot be reconstructed by the reader). One declaration,
 * consumed by both.
 *
 * EVERY ROW CARRIES A `citation`: the member's OWN file:line that declares the
 * capability. `verify/parity.mjs` opens each cited file and requires the cited
 * line to still contain the named token, so a member that moves a route makes
 * this ledger FAIL rather than silently describe a surface that no longer exists.
 * That check is the answer to "a described capability is not a measured one".
 *
 * THE FOURTH MEMBER WAS EXCLUDED IN THE FIRST READING AND IS NOW FUSED, ON THE
 * CENSUS. `dsh-recall-console` mutates nothing and its intent is recall rather
 * than evolution; the program's census lane nonetheless placed it INSIDE the
 * cluster — `research/fusion-census.json` cluster C5 "Evolution and recall
 * consoles", four members — and the standing instruction is that the census is
 * adopted when it contradicts a lane's provisional reading. So it is adopted, the
 * reversal and the standing evidence are recorded in {@link CENSUS_ADOPTION}, and
 * the census's own sentence is the reason: "the population is shared even though
 * the panel is not" is an argument for composing it, not for dropping it.
 *
 * EXCLUSIONS ARE A SEPARATE QUESTION. Nothing in this cluster is same-intent
 * NOISE, so {@link EXCLUDED_MEMBERS} is empty; the members considered and NOT
 * fused are sibling clusters the census itself declined (C7, C9), and the
 * distinction between the two lists is stated so an empty exclusion list cannot be
 * read as "every plugin sharing a word belongs here".
 *
 * @module dsh-meta-skills/shared/protocol
 */

/** The one route prefix this plugin owns. Nothing else is registered. */
export const ROUTE_PREFIX = '/meta-skills'

/**
 * THE DISPATCH TABLE, AND IT IS ALSO THE ADVERTISED PATH LIST.
 *
 * Two things forced this table to be explicit rather than derived at run time
 * from {@link CAPABILITIES}:
 *
 *  1. **An advertised path must be authoritative.** The program's own recorded
 *     defect is a route table that advertises a path nobody serves — worse than an
 *     absent path, because the 404 body is the one place whose job is to be
 *     authoritative. A table that is the dispatcher cannot advertise a path it
 *     does not serve, and a parity harness can drive the table and the surface
 *     with the same list.
 *  2. **A capability-parity instrument identifies a route by its DISPATCH NAME**
 *     inside the prefix, not by its path — a fused plugin owns a new prefix, so a
 *     path-keyed identity would call every member route absent. The KEYS here are
 *     therefore the members' OWN dispatch names (the branch names in
 *     `dsh-tools-skills-evolve/src/shared/protocol.ts:39`, the `route === '…'`
 *     labels in the two consoles, and the `case '…'` labels in
 *     `dsh-skill-evolution`'s channel), so a fused row and a member row carry the
 *     SAME identity and the path becomes an ATTRIBUTE that moved rather than an
 *     identity that vanished.
 *
 * The values are the fused paths under {@link ROUTE_PREFIX}. `verify/parity.mjs`
 * asserts this table and {@link CAPABILITIES} agree row for row, so the two
 * encodings of one fact cannot drift apart silently.
 */
export const ROUTE_PATHS = {
  'list': '/api/skills/list',
  'listModels': '/api/skills/listModels',
  'setModel': '/api/skills/setModel',
  'resetModel': '/api/skills/resetModel',
  'setLanguage': '/api/skills/setLanguage',
  'setEnabled': '/api/skills/setEnabled',
  'setTuning': '/api/skills/setTuning',
  'resetTuning': '/api/skills/resetTuning',
  'setPrompt': '/api/skills/setPrompt',
  'get': '/api/skills/get',
  'remove': '/api/skills/remove',
  'clear': '/api/skills/clear',
  'gateStats': '/api/skills/gateStats',
  'audit': '/api/skills/audit',
  'state': '/api/tools/state',
  'knobs': '/api/tools/knobs',
  'registry': '/api/tools/registry',
  'decide': '/api/tools/decide',
  'metaControl': '/api/tools/meta/control',
  // dsh-tools-skills-evolve grew two routes after this table was written: the
  // per-tool guard control and its view. Added here because a fused surface that
  // drops a member route is a capability DELETED, and the parity harness caught it
  // as a population mismatch (5 declared vs 7 dispatched) rather than silently.
  'toolControl': '/api/tools/control',
  // `toolView`'s member path is `/api/tools` itself, so its FUSED path is the
  // family base and the dispatcher matches a declared path by equality as well as
  // by prefix; its upstream tail comes from the ledger, not from the fused path.
  'toolView': '/api/tools',
  'tools': '/api/recall/tools',
  'tools/select': '/api/recall/tools/select',
  'skills': '/api/recall/skills',
  'skills/recall': '/api/recall/skills/recall',
  'scripts': '/api/recall/scripts',
  'status': '/api/recall/status',
  'recall-events': '/api/recall/recall-events',
  'catalog': '/api/pipeline/catalog',
  'traces': '/api/pipeline/traces',
  'arm': '/api/pipeline/arm',
  'disable': '/api/pipeline/disable',
  'remine': '/api/pipeline/remine',
  'qa': '/api/pipeline/qa',
  'qa/answer': '/api/pipeline/qa/answer',
  // ---- dsh-skill-studio (D-0357). The member dispatches by ARRAY INDEX
  // (`path === ROUTE_PATHS[n]`, src/host/routes.ts:476-616) and publishes no
  // names, so these keys are this file's own stable labels for the seven slots;
  // each ledger row cites the INDEX COMPARISON that serves it, and the member's
  // own path array at src/host/routes.ts:96-104 is what the indices resolve to.
  'studioState': '/api/studio/state',
  'studioPropose': '/api/studio/propose',
  'studioPromote': '/api/studio/promote',
  'studioRefuse': '/api/studio/refuse',
  'studioRounds': '/api/studio/rounds',
  'studioMembers': '/api/studio/members',
  'studioGrant': '/api/studio/grant',
} as const

/**
 * THE VERB OF EACH DECLARED ROUTE, declared rather than passed through.
 *
 * Two reasons this is a table and not a passthrough. First, a fused surface that
 * accepts any verb on any path cannot say what it serves: a `DELETE` on a read
 * route would be forwarded and the member's own 405 would arrive looking like this
 * plugin's answer. Second, a capability-parity instrument refuses to fetch a route
 * whose verb it cannot derive from source — correctly, because "a route of unknown
 * verb might write" — so an undeclared verb makes every read look undrivable.
 *
 * The verbs here are the members' own guards, one per row, and `verify/parity.mjs`
 * asserts this table, {@link ROUTE_PATHS} and {@link CAPABILITIES} agree row for row.
 */
export const ROUTE_METHODS = {
  'list': 'POST',
  'listModels': 'POST',
  'setModel': 'POST',
  'resetModel': 'POST',
  'setLanguage': 'POST',
  'setEnabled': 'POST',
  'setTuning': 'POST',
  'resetTuning': 'POST',
  'setPrompt': 'POST',
  'get': 'POST',
  'remove': 'POST',
  'clear': 'POST',
  'gateStats': 'POST',
  'audit': 'POST',
  'state': 'GET',
  'knobs': 'POST',
  'registry': 'GET',
  'decide': 'POST',
  'metaControl': 'POST',
  'toolControl': 'POST',
  'toolView': 'GET',
  'tools': 'GET',
  'tools/select': 'POST',
  'skills': 'GET',
  'skills/recall': 'POST',
  'scripts': 'GET',
  'status': 'GET',
  'recall-events': 'GET',
  'catalog': 'GET',
  'traces': 'GET',
  'arm': 'POST',
  'disable': 'POST',
  'remine': 'POST',
  'qa': 'GET',
  'qa/answer': 'POST',
  'studioState': 'GET',
  'studioPropose': 'POST',
  'studioPromote': 'POST',
  'studioRefuse': 'POST',
  'studioRounds': 'GET',
  'studioMembers': 'GET',
  'studioGrant': 'POST',
} as const

/** One declared route's dispatch name. */
export type RouteName = keyof typeof ROUTE_PATHS

/** The ledger route: what the fused surface claims to absorb, with live status. */
export const CAPABILITIES_PATH = '/api/capabilities'

/** The liveness route: one probe per member, with the probe's own clock. */
export const HEALTH_PATH = '/api/health'

/**
 * The four fused namespaces, each forwarding into one member's own prefix.
 *
 * The member prefixes are the members' SHIPPED constants, quoted here rather
 * than derived, because this surface composes them over HTTP and a silent change
 * on either side must be visible in this file:
 *   - `dsh-skill-evolution`    → `/skill-evolution`  (plugin.mjs:69 `RPC_CHANNEL`)
 *   - `dsh-tools-skills-evolve`→ `/tools-skills-evolve` (src/shared/protocol.ts:25)
 *   - `dsh-recall-console`     → `/recall-console/api` (src/shared/protocol.ts:62 `ROUTE_PATH`)
 *   - `dsh-evolution-console`  → `/evolution/api`    (src/shared/protocol.ts:36)
 *   - `dsh-skill-studio`       → `/skill-studio/api` (src/host/routes.ts:96-104, `ROUTE_PATHS`)
 *
 * THE FIFTH FAMILY IS AUTHORISED BY `D-0357`, NOT BY THE CENSUS, and this file
 * says so because the difference decides what may be asserted about it. The
 * census (`research/fusion-census.json`, generated 2026-10-26T10:30:00Z) contains
 * **zero** occurrences of `skill-studio`; it neither named the plugin nor declined
 * it. `D-0357` (`2026-10-26T12:11:45.642Z`) names the absorption in terms — "Skill
 * studio folds into dsh-meta-skills (authorized by D-0352)" — and it overrules this
 * ledger's earlier refusal, which is kept and refuted in
 * {@link FUSED_BEYOND_CENSUS} rather than deleted.
 */
export const FAMILIES = {
  skills: {
    family: 'skills',
    member: 'dsh-skill-evolution',
    fusedBase: '/api/skills',
    upstreamBase: '/skill-evolution',
    /** The member's channel speaks the harness RPC envelope, so the path carries the method. */
    wire: 'envelope',
  },
  tools: {
    family: 'tools',
    member: 'dsh-tools-skills-evolve',
    fusedBase: '/api/tools',
    upstreamBase: '/tools-skills-evolve/api',
    wire: 'json',
  },
  recall: {
    family: 'recall',
    member: 'dsh-recall-console',
    fusedBase: '/api/recall',
    upstreamBase: '/recall-console/api',
    wire: 'json',
  },
  pipeline: {
    family: 'pipeline',
    member: 'dsh-evolution-console',
    fusedBase: '/api/pipeline',
    upstreamBase: '/evolution/api',
    wire: 'json',
  },
  studio: {
    family: 'studio',
    member: 'dsh-skill-studio',
    fusedBase: '/api/studio',
    upstreamBase: '/skill-studio/api',
    wire: 'json',
  },
} as const

/** The three members this surface composes. */
export type Family = keyof typeof FAMILIES

/**
 * What kind of thing a capability is.
 *
 * `route`      — an HTTP endpoint, driven by the parity harness over the wire.
 * `seat`       — a user-visible GUI seat. The fused surface carries exactly ONE
 *                entry instead of the members' three; the capability is the
 *                OPERATIONS behind the seat, which the entry reaches.
 * `in-process` — a service the member publishes to other plugins, not a route.
 */
export type CapabilityKind = 'route' | 'seat' | 'in-process'

/** The wire shape a route capability carries. */
export type Wire = 'envelope' | 'json'

/** One declared capability of one member. */
export interface Capability {
  /** Stable id, unique across the ledger. */
  readonly id: string
  /** Which member it belongs to. */
  readonly family: Family
  /** The member plugin's package name. */
  readonly member: string
  readonly kind: CapabilityKind
  /** HTTP verb; `-` for seats and in-process services. */
  readonly verb: 'GET' | 'POST' | '-'
  /** The path UNDER {@link ROUTE_PREFIX} that serves it, or `null` when it is not a route. */
  readonly fusedPath: string | null
  /** The member's own path, or `null` when it is not a route. */
  readonly upstreamPath: string | null
  /** `file:line` inside the member's source that declares this capability. */
  readonly citation: string
  /** A token that must still appear on the cited line (the citation's own check). */
  readonly citedToken: string
  readonly wire: Wire | null
  /** `null` = expected reachable. A string = why it is UNMEASURED, and never a zero. */
  readonly unmeasuredReason: string | null
  /** One line the ledger publishes verbatim, so a reader knows what the row drives. */
  readonly what: string
}

/**
 * The ledger. Built by ENUMERATION of the members' own dispatch tables, not by
 * reading their prose: the fourteen channel methods are the `switch (endpoint)`
 * cases at `plugin.mjs:1809-1971`, the five gate routes are the `ROUTE_PATHS`
 * comparisons at `src/host/routes.ts:218-251`, and the seven pipeline routes are
 * the `route ===` comparisons at `src/host/routes.ts:183-215`.
 */
export const CAPABILITIES: readonly Capability[] = [
  // ---------------------------------------------------------------- skills (14 channel methods)
  {
    id: 'skills.rpc.list', family: 'skills', member: 'dsh-skill-evolution', kind: 'route', verb: 'POST',
    fusedPath: '/api/skills/list', upstreamPath: '/skill-evolution/list',
    citation: 'plugin.mjs:1809', citedToken: "case 'list':", wire: 'envelope', unmeasuredReason: null,
    what: 'the evolved-skill list, the live catalog snapshot, the initial-prompt selection records and the config/stats blocks',
  },
  {
    id: 'skills.rpc.listModels', family: 'skills', member: 'dsh-skill-evolution', kind: 'route', verb: 'POST',
    fusedPath: '/api/skills/listModels', upstreamPath: '/skill-evolution/listModels',
    citation: 'plugin.mjs:1833', citedToken: "case 'listModels':", wire: 'envelope', unmeasuredReason: null,
    what: 'the reviewer-model roster: providers and their models, read from the host LLM service',
  },
  {
    id: 'skills.rpc.setModel', family: 'skills', member: 'dsh-skill-evolution', kind: 'route', verb: 'POST',
    fusedPath: '/api/skills/setModel', upstreamPath: '/skill-evolution/setModel',
    citation: 'plugin.mjs:1853', citedToken: "case 'setModel':", wire: 'envelope', unmeasuredReason: null,
    what: 'persist the reviewer provider/model into the member runtime config',
  },
  {
    id: 'skills.rpc.resetModel', family: 'skills', member: 'dsh-skill-evolution', kind: 'route', verb: 'POST',
    fusedPath: '/api/skills/resetModel', upstreamPath: '/skill-evolution/resetModel',
    citation: 'plugin.mjs:1874', citedToken: "case 'resetModel':", wire: 'envelope', unmeasuredReason: null,
    what: 'drop the reviewer override and return to the deployment default model',
  },
  {
    id: 'skills.rpc.setLanguage', family: 'skills', member: 'dsh-skill-evolution', kind: 'route', verb: 'POST',
    fusedPath: '/api/skills/setLanguage', upstreamPath: '/skill-evolution/setLanguage',
    citation: 'plugin.mjs:1881', citedToken: "case 'setLanguage':", wire: 'envelope', unmeasuredReason: null,
    what: 'set the language the crystallized skill bodies are written in',
  },
  {
    id: 'skills.rpc.setEnabled', family: 'skills', member: 'dsh-skill-evolution', kind: 'route', verb: 'POST',
    fusedPath: '/api/skills/setEnabled', upstreamPath: '/skill-evolution/setEnabled',
    citation: 'plugin.mjs:1889', citedToken: "case 'setEnabled':", wire: 'envelope', unmeasuredReason: null,
    what: 'switch the trace observer on or off for this process',
  },
  {
    id: 'skills.rpc.setTuning', family: 'skills', member: 'dsh-skill-evolution', kind: 'route', verb: 'POST',
    fusedPath: '/api/skills/setTuning', upstreamPath: '/skill-evolution/setTuning',
    citation: 'plugin.mjs:1896', citedToken: "case 'setTuning':", wire: 'envelope', unmeasuredReason: null,
    what: 'the eleven crystallization thresholds (minTraceSteps, minSuccessRate, maxEvolvedSkills, improvementEvery, …)',
  },
  {
    id: 'skills.rpc.resetTuning', family: 'skills', member: 'dsh-skill-evolution', kind: 'route', verb: 'POST',
    fusedPath: '/api/skills/resetTuning', upstreamPath: '/skill-evolution/resetTuning',
    citation: 'plugin.mjs:1906', citedToken: "case 'resetTuning':", wire: 'envelope', unmeasuredReason: null,
    what: 'restore every crystallization threshold to its shipped default',
  },
  {
    id: 'skills.rpc.setPrompt', family: 'skills', member: 'dsh-skill-evolution', kind: 'route', verb: 'POST',
    fusedPath: '/api/skills/setPrompt', upstreamPath: '/skill-evolution/setPrompt',
    citation: 'plugin.mjs:1912', citedToken: "case 'setPrompt':", wire: 'envelope', unmeasuredReason: null,
    what: 'replace the reviewer prompt that decides whether a trace crystallizes',
  },
  {
    id: 'skills.rpc.get', family: 'skills', member: 'dsh-skill-evolution', kind: 'route', verb: 'POST',
    fusedPath: '/api/skills/get', upstreamPath: '/skill-evolution/get',
    citation: 'plugin.mjs:1923', citedToken: "case 'get':", wire: 'envelope', unmeasuredReason: null,
    what: 'one crystallized skill record by name, with its evidence and version history',
  },
  {
    id: 'skills.rpc.remove', family: 'skills', member: 'dsh-skill-evolution', kind: 'route', verb: 'POST',
    fusedPath: '/api/skills/remove', upstreamPath: '/skill-evolution/remove',
    citation: 'plugin.mjs:1929', citedToken: "case 'remove':", wire: 'envelope', unmeasuredReason: null,
    what: 'unregister and delete one crystallized skill',
  },
  {
    id: 'skills.rpc.clear', family: 'skills', member: 'dsh-skill-evolution', kind: 'route', verb: 'POST',
    fusedPath: '/api/skills/clear', upstreamPath: '/skill-evolution/clear',
    citation: 'plugin.mjs:1945', citedToken: "case 'clear':", wire: 'envelope', unmeasuredReason: null,
    what: 'unregister and delete every crystallized skill in one operation',
  },
  {
    id: 'skills.rpc.gateStats', family: 'skills', member: 'dsh-skill-evolution', kind: 'route', verb: 'POST',
    fusedPath: '/api/skills/gateStats', upstreamPath: '/skill-evolution/gateStats',
    citation: 'plugin.mjs:1965', citedToken: "case 'gateStats':", wire: 'envelope', unmeasuredReason: null,
    what: 'the promotion gate census: proceed / held / abstained / unavailable counts with their denominators',
  },
  {
    id: 'skills.rpc.audit', family: 'skills', member: 'dsh-skill-evolution', kind: 'route', verb: 'POST',
    fusedPath: '/api/skills/audit', upstreamPath: '/skill-evolution/audit',
    citation: 'plugin.mjs:1971', citedToken: "case 'audit':", wire: 'envelope', unmeasuredReason: null,
    what: 'the crystallization audit trail, one row per evaluated turn',
  },
  // ---------------------------------------------------------------- skills seat + service
  {
    id: 'skills.seat.settings', family: 'skills', member: 'dsh-skill-evolution', kind: 'seat', verb: '-',
    fusedPath: null, upstreamPath: null,
    citation: 'client.js:891', citedToken: 'settings.section', wire: null, unmeasuredReason: null,
    what: "the member's own settings.section (id skill-evolution, order 300), replaced on the fused surface by the one meta-skills entry whose Skills tab reaches all fourteen methods above",
  },
  {
    id: 'skills.service.skillSelection', family: 'skills', member: 'dsh-skill-evolution', kind: 'in-process', verb: '-',
    fusedPath: null, upstreamPath: null,
    citation: 'plugin.mjs:2481', citedToken: "ctx.provide('skillSelection'", wire: null,
    unmeasuredReason: 'IN-PROCESS ONLY: the member publishes `ctx.skillSelection` to other plugins, not over HTTP, so a composing surface cannot serve it and this ledger will not claim it does — the member stays loaded (D-0352 rule 3) and still publishes it',
    what: 'a read-only accessor over the selection records, for mount-time callers that cannot reach the RPC channel',
  },
  // ---------------------------------------------------------------- tools (5 gate routes)
  {
    id: 'tools.state', family: 'tools', member: 'dsh-tools-skills-evolve', kind: 'route', verb: 'GET',
    fusedPath: '/api/tools/state', upstreamPath: '/tools-skills-evolve/api/state',
    citation: 'src/host/routes.ts:218', citedToken: 'ROUTE_PATHS.state', wire: 'json', unmeasuredReason: null,
    what: 'the graded proposal queue, the knob values in force, the promotion rule and the ledger census',
  },
  {
    id: 'tools.knobs', family: 'tools', member: 'dsh-tools-skills-evolve', kind: 'route', verb: 'POST',
    fusedPath: '/api/tools/knobs', upstreamPath: '/tools-skills-evolve/api/knobs',
    citation: 'src/host/routes.ts:223', citedToken: 'ROUTE_PATHS.knobs', wire: 'json', unmeasuredReason: null,
    what: 'set a gate knob and RE-GRADE the queue, reporting which verdicts moved',
  },
  {
    id: 'tools.registry', family: 'tools', member: 'dsh-tools-skills-evolve', kind: 'route', verb: 'GET',
    fusedPath: '/api/tools/registry', upstreamPath: '/tools-skills-evolve/api/registry',
    citation: 'src/host/routes.ts:234', citedToken: 'ROUTE_PATHS.registry', wire: 'json', unmeasuredReason: null,
    what: 'the live tool declarations the proposals are derived from, with their token cost',
  },
  {
    id: 'tools.decide', family: 'tools', member: 'dsh-tools-skills-evolve', kind: 'route', verb: 'POST',
    fusedPath: '/api/tools/decide', upstreamPath: '/tools-skills-evolve/api/decide',
    citation: 'src/host/routes.ts:251', citedToken: 'ROUTE_PATHS.decide', wire: 'json', unmeasuredReason: null,
    what: 'apply the Q1-Q7 grader to one proposal and record the decision in the append-only ledger',
  },
  {
    id: 'tools.metaControl', family: 'tools', member: 'dsh-tools-skills-evolve', kind: 'route', verb: 'POST',
    fusedPath: '/api/tools/meta/control', upstreamPath: '/tools-skills-evolve/api/meta/control',
    citation: 'src/host/routes.ts:239', citedToken: 'ROUTE_PATHS.metaControl', wire: 'json', unmeasuredReason: null,
    what: 'control the two meta artifacts (skill + tool) the loop acts on',
  },
  {
    id: 'tools.seat.panel', family: 'tools', member: 'dsh-tools-skills-evolve', kind: 'seat', verb: '-',
    fusedPath: null, upstreamPath: null,
    citation: 'src/client/index.tsx:123', citedToken: "name: 'main'", wire: null, unmeasuredReason: null,
    what: 'the member\'s keyed main panel plus its sidebar.panellist row (src/client/index.tsx:136), replaced on the fused surface by the one meta-skills entry whose Gate tab reaches the five routes above',
  },
  // ---------------------------------------------------------------- pipeline (7 console routes)
  {
    id: 'pipeline.catalog', family: 'pipeline', member: 'dsh-evolution-console', kind: 'route', verb: 'GET',
    fusedPath: '/api/pipeline/catalog', upstreamPath: '/evolution/api/catalog',
    citation: 'src/host/routes.ts:183', citedToken: "route === 'catalog'", wire: 'json', unmeasuredReason: null,
    what: 'the mined capability candidates joined to the arm/disable state, with unmeasured values named as such',
  },
  {
    id: 'pipeline.traces', family: 'pipeline', member: 'dsh-evolution-console', kind: 'route', verb: 'GET',
    fusedPath: '/api/pipeline/traces', upstreamPath: '/evolution/api/traces',
    citation: 'src/host/routes.ts:189', citedToken: "route === 'traces'", wire: 'json', unmeasuredReason: null,
    what: 'the failure clusters and scan scope of the trace corpus the candidates were mined from',
  },
  {
    id: 'pipeline.arm', family: 'pipeline', member: 'dsh-evolution-console', kind: 'route', verb: 'POST',
    fusedPath: '/api/pipeline/arm', upstreamPath: '/evolution/api/arm',
    citation: 'src/host/routes.ts:195', citedToken: "route === 'arm'", wire: 'json', unmeasuredReason: null,
    what: 'arm one mined candidate (the console is the only writer of evolution/state.json)',
  },
  {
    id: 'pipeline.disable', family: 'pipeline', member: 'dsh-evolution-console', kind: 'route', verb: 'POST',
    fusedPath: '/api/pipeline/disable', upstreamPath: '/evolution/api/disable',
    citation: 'src/host/routes.ts:195', citedToken: "route === 'disable'", wire: 'json', unmeasuredReason: null,
    what: 'disable one mined candidate, same writer, same audit',
  },
  {
    id: 'pipeline.remine', family: 'pipeline', member: 'dsh-evolution-console', kind: 'route', verb: 'POST',
    fusedPath: '/api/pipeline/remine', upstreamPath: '/evolution/api/remine',
    citation: 'src/host/routes.ts:203', citedToken: "route === 'remine'", wire: 'json', unmeasuredReason: null,
    what: 're-mine and report the census timestamp BEFORE and AFTER',
  },
  {
    id: 'pipeline.qa', family: 'pipeline', member: 'dsh-evolution-console', kind: 'route', verb: 'GET',
    fusedPath: '/api/pipeline/qa', upstreamPath: '/evolution/api/qa',
    citation: 'src/host/routes.ts:209', citedToken: "route === 'qa'", wire: 'json', unmeasuredReason: null,
    what: 'the operator Q&A items and their recorded verdicts',
  },
  {
    id: 'pipeline.qaAnswer', family: 'pipeline', member: 'dsh-evolution-console', kind: 'route', verb: 'POST',
    fusedPath: '/api/pipeline/qa/answer', upstreamPath: '/evolution/api/qa/answer',
    citation: 'src/host/routes.ts:215', citedToken: "route === 'qa/answer'", wire: 'json', unmeasuredReason: null,
    what: 'record an operator verdict on one Q&A item',
  },
  {
    id: 'pipeline.seat.settings', family: 'pipeline', member: 'dsh-evolution-console', kind: 'seat', verb: '-',
    fusedPath: null, upstreamPath: null,
    citation: 'src/client/index.tsx:40', citedToken: "'settings.section'", wire: null, unmeasuredReason: null,
    what: 'the console\'s own settings.section (id evolution-console, order 30), replaced on the fused surface by the one meta-skills entry whose Pipeline tab reaches the seven routes above',
  },

  // ---- dsh-recall-console: the fourth member, fused on the census (CENSUS_ADOPTION).
  {
    id: 'recall.tools', family: 'recall', member: 'dsh-recall-console', kind: 'route', verb: 'GET',
    fusedPath: '/api/recall/tools', upstreamPath: '/recall-console/api/tools',
    citation: 'src/host/routes.ts:179', citedToken: "route === 'tools'", wire: 'json', unmeasuredReason: null,
    what: 'the tool recall posture: which of delivered / absent / blocked each tool kind is in, and the evidence for it',
  },
  {
    id: 'recall.toolsSelect', family: 'recall', member: 'dsh-recall-console', kind: 'route', verb: 'POST',
    fusedPath: '/api/recall/tools/select', upstreamPath: '/recall-console/api/tools/select',
    citation: 'src/host/routes.ts:185', citedToken: "route === 'tools/select'", wire: 'json', unmeasuredReason: null,
    what: 'select the tools that answer one stated intent, by exact name against the enumerable registry',
  },
  {
    id: 'recall.skills', family: 'recall', member: 'dsh-recall-console', kind: 'route', verb: 'GET',
    fusedPath: '/api/recall/skills', upstreamPath: '/recall-console/api/skills',
    citation: 'src/host/routes.ts:194', citedToken: "route === 'skills'", wire: 'json', unmeasuredReason: null,
    what: 'the skill recall posture over the injected skill catalog',
  },
  {
    id: 'recall.skillsRecall', family: 'recall', member: 'dsh-recall-console', kind: 'route', verb: 'POST',
    fusedPath: '/api/recall/skills/recall', upstreamPath: '/recall-console/api/skills/recall',
    citation: 'src/host/routes.ts:200', citedToken: "route === 'skills/recall'", wire: 'json', unmeasuredReason: null,
    what: 'semantic skill recall for one query, through the member\'s own retriever',
  },
  {
    id: 'recall.scripts', family: 'recall', member: 'dsh-recall-console', kind: 'route', verb: 'GET',
    fusedPath: '/api/recall/scripts', upstreamPath: '/recall-console/api/scripts',
    citation: 'src/host/routes.ts:209', citedToken: "route === 'scripts'", wire: 'json', unmeasuredReason: null,
    what: 'the script posture, which the member reports as a kind with no agreed referent rather than as a zero',
  },
  {
    id: 'recall.status', family: 'recall', member: 'dsh-recall-console', kind: 'route', verb: 'GET',
    fusedPath: '/api/recall/status', upstreamPath: '/recall-console/api/status',
    citation: 'src/host/routes.ts:215', citedToken: "route === 'status'", wire: 'json', unmeasuredReason: null,
    what: 'the cross-kind status census',
  },
  {
    id: 'recall.recallEvents', family: 'recall', member: 'dsh-recall-console', kind: 'route', verb: 'GET',
    fusedPath: '/api/recall/recall-events', upstreamPath: '/recall-console/api/recall-events',
    citation: 'src/host/routes.ts:221', citedToken: "route === 'recall-events'", wire: 'json', unmeasuredReason: null,
    what: 'the observed recall events',
  },
  {
    id: 'recall.seat.settings', family: 'recall', member: 'dsh-recall-console', kind: 'seat', verb: '-',
    fusedPath: null, upstreamPath: null,
    citation: 'src/client/index.tsx:43', citedToken: "'recall-console'", wire: null, unmeasuredReason: null,
    what: 'the console\'s own settings.section (id recall-console, order 35), replaced on the fused surface by the one meta-skills entry whose Recall tab reaches the seven routes above',
  },
  // ---- dsh-skill-studio: fused under D-0357 (the fifth family). -----------
  //
  // The member dispatches by ARRAY INDEX (`path === ROUTE_PATHS[n]`,
  // src/host/routes.ts:476-616) and publishes no branch names, so each row
  // cites the INDEX COMPARISON that serves it; the member's own path array at
  // src/host/routes.ts:96-104 is what those indices resolve to. The reversal
  // of this ledger's earlier refusal is recorded in FUSED_BEYOND_CENSUS.
  {
    id: 'studio.state', family: 'studio', member: 'dsh-skill-studio', kind: 'route', verb: 'GET',
    fusedPath: '/api/studio/state', upstreamPath: '/skill-studio/api/state',
    citation: 'src/host/routes.ts:476', citedToken: 'ROUTE_PATHS[0]', wire: 'json', unmeasuredReason: null,
    what: 'the catalog the model can actually see (decomposed into scanned-root and plugin-snapshot counts), what is staged with its four-criterion grade, what is promoted and whether the catalog LISTS it, the round census, and the per-member fleet with its grant table — with `null` where a source was NOT READ, never 0',
  },
  {
    id: 'studio.propose', family: 'studio', member: 'dsh-skill-studio', kind: 'route', verb: 'POST',
    fusedPath: '/api/studio/propose', upstreamPath: '/skill-studio/api/propose',
    citation: 'src/host/routes.ts:505', citedToken: 'ROUTE_PATHS[1]', wire: 'json', unmeasuredReason: null,
    what: 'stage a candidate under state/skill-staging/ (invisible to the model), graded on write, labelled deterministic-fallback because this member has no LLM adapter, with catalogBefore/catalogAfter written to the round ledger',
  },
  {
    id: 'studio.promote', family: 'studio', member: 'dsh-skill-studio', kind: 'route', verb: 'POST',
    fusedPath: '/api/studio/promote', upstreamPath: '/skill-studio/api/promote',
    citation: 'src/host/routes.ts:543', citedToken: 'ROUTE_PATHS[2]', wire: 'json', unmeasuredReason: null,
    what: 'the atomic rename out of staging into the SCANNED root .agents/skills/, refused unless the four-criterion grade passed, reporting whether the visible catalog count actually moved and warning when the directory is present but unlisted',
  },
  {
    id: 'studio.refuse', family: 'studio', member: 'dsh-skill-studio', kind: 'route', verb: 'POST',
    fusedPath: '/api/studio/refuse', upstreamPath: '/skill-studio/api/refuse',
    citation: 'src/host/routes.ts:590', citedToken: 'ROUTE_PATHS[3]', wire: 'json', unmeasuredReason: null,
    what: 'record a refusal WITH its reason in the append-only round ledger, carrying the catalog reading on both sides so "refused and nothing moved" is distinguishable from "refused and something else changed it"',
  },
  {
    id: 'studio.rounds', family: 'studio', member: 'dsh-skill-studio', kind: 'route', verb: 'GET',
    fusedPath: '/api/studio/rounds', upstreamPath: '/skill-studio/api/rounds',
    citation: 'src/host/routes.ts:499', citedToken: 'ROUTE_PATHS[4]', wire: 'json', unmeasuredReason: null,
    what: 'the append-only round ledger newest-first, with a COUNT of malformed lines rather than a silent drop',
  },
  {
    id: 'studio.members', family: 'studio', member: 'dsh-skill-studio', kind: 'route', verb: 'GET',
    fusedPath: '/api/studio/members', upstreamPath: '/skill-studio/api/members',
    citation: 'src/host/routes.ts:483', citedToken: 'ROUTE_PATHS[5]', wire: 'json', unmeasuredReason: null,
    what: 'the live member census: each member\'s OWN catalog resolved through that member\'s own scope, the folded grant table, and members: [] with a non-null reason when the census could NOT be taken — a different fact from an empty fleet',
  },
  {
    id: 'studio.grant', family: 'studio', member: 'dsh-skill-studio', kind: 'route', verb: 'POST',
    fusedPath: '/api/studio/grant', upstreamPath: '/skill-studio/api/grant',
    citation: 'src/host/routes.ts:616', citedToken: 'ROUTE_PATHS[6]', wire: 'json', unmeasuredReason: null,
    what: 'set or lift a per-member skill mask through `member.ctx.get("skills").restrict({ deny: [skill] })` (members.ts:202), then RE-READ the catalog of the subject so the answer is an outcome that moved rather than a value the caller wrote back; an unattributed grant is refused, because a grant with no `by` is a rumour with a timestamp',
  },
  {
    id: 'studio.seat.panel', family: 'studio', member: 'dsh-skill-studio', kind: 'seat', verb: '-',
    fusedPath: null, upstreamPath: null,
    citation: 'src/client/index.ts:94', citedToken: "'dsh-skill-studio:studio'", wire: null, unmeasuredReason: null,
    what: "the studio's own sidebar.panellist row (id dsh-skill-studio:studio, order 6.6 at src/client/index.ts:99) plus its keyed main panel, replaced on the fused surface by the one meta-skills entry whose Studio tab reaches the seven routes above",
  },
] as const

/**
 * The fifth member was fused on a DECISION rather than on the census, and the
 * difference is recorded because it decides what may be claimed.
 *
 * `D-0357` (`lead`, `2026-10-26T12:11:45.642Z`, active) states in terms: *"Skill
 * studio folds into dsh-meta-skills (authorized by D-0352)"*. The census never
 * covered the plugin — `research/fusion-census.json` contains **zero** occurrences
 * of `skill-studio`, so it neither named nor declined it — and this ledger's own
 * earlier refusal is kept beside its refutation so a later reader can audit the
 * reversal instead of finding only its conclusion.
 *
 * THE REFUTATION, CLAUSE BY CLAUSE, because "we changed our mind" is not evidence.
 *   - "same VERB and a different SUBJECT" — REFUTED on the subject. The subject is
 *     the injected skill catalog: what the model can see and select. The member's
 *     own subtitle is *"How many skills the model can see, what is staged, and
 *     whether a promotion moved the number"* (`src/client/locales.ts:32`) — the
 *     same question `dsh-recall-console`'s `/api/recall/skills` row answers and the
 *     same population `dsh-skill-evolution`'s `list` reports.
 *   - "it is a per-agent grant editor" — REFUTED as a description of the surface:
 *     TWO of seven routes concern grants; the other five stage, grade, promote,
 *     refuse and read the round ledger.
 *   - "it neither mines a capability nor promotes one" — the MINE half holds (it
 *     reads no trace corpus); the PROMOTE half is false: `/promote` is an atomic
 *     `rename` into the scanned root (`src/host/routes.ts:568-573`).
 *   - "controls no evolution stage" — REFUTED as stated: staged -> graded ->
 *     promoted IS a stage machine, and promote REFUSES on a failed grade rather
 *     than grey-mousing a button (`src/host/routes.ts:561-564`).
 *   - THE CENSUS CLAUSE, and this one is load-bearing: the earlier row said the
 *     census "declined it too rather than this lane declining it alone". The census
 *     does not mention the plugin at all. **Not named is not declined** — an absent
 *     reading is not a negative one — so the second corroboration never existed and
 *     the decline rested on one reader's mischaracterisation.
 *
 * WHAT IS TRUE AND STILL STANDS: the member writes a DIFFERENT STORE from the
 * evolution member — the on-disk scanned root plus a per-member mask, versus the
 * runtime `ctx.skills` registry — so it is composed as a fifth family and neither
 * member's write path is touched.
 */
export const FUSED_BEYOND_CENSUS = [
  {
    member: 'dsh-skill-studio',
    decision: 'D-0357',
    decidedAt: '2026-10-26T12:11:45.642Z',
    census: 'none: research/fusion-census.json contains zero occurrences of "skill-studio"',
    what: 'the stage -> grade -> promote studio over the SCANNED skill root, plus the per-member skill mask; seven routes under /skill-studio/api and one sidebar row at order 6.6',
    why: 'the surface answers the SAME question this family already composes — which skills the model can see and select — and differs only in WRITE TARGET (on-disk scanned root + per-member mask, versus the runtime registry), so it is a third write mode of one subject rather than a rival surface',
    refusedBy: 'this ledger, in an earlier revision, as "same VERB (grant a skill) and a different SUBJECT"; refuted on its own evidence (see the block comment above) and on the reading of the owner',
    ownerWording: '"Skills&tools" & "Skills&Evolution" & "Skill studio" are not fused.',
  },
] as const

/**
 * The members this surface does NOT absorb. EMPTY ON PURPOSE, and it is kept as an
 * empty list rather than deleted so that a reader can tell "nothing was excluded"
 * from "the exclusion list was never written".
 *
 * `dsh-recall-console` sits in the same sidebar neighbourhood and shares the
 * words "skill" and "tool", which is exactly the evidence that is NOT evidence.
 * The intent test this program applies is what the plugin MUTATES and what
 * question it answers:
 *
 *  - it answers a RECALL question ("given an intent, what can be recalled, and
 *    what posture is each kind in"), not an EVOLUTION question;
 *  - it writes NOTHING (`src/host/index.ts:31-36`: "This plugin writes nothing at
 *    all"), so it is an observer of a different mechanism rather than a view of
 *    the evolution pipeline;
 *  - it states in its own words that activation belongs to the harness, not to
 *    it (`src/host/index.ts:24-27`), i.e. it is not a control surface either;
 *  - it is a distinct programme target (T8, `plan/08-roadmap-targets.md` §6),
 *    with its own state document (`plan/17-t8-recalls-state.md`).
 *
 * Fusing it would put a no-write discovery reader behind an "evolution" name —
 * the false fusion `D-0352` says is worse than a missed one.
 */
/**
 * CONSIDERED AND NOT FUSED, kept so a reader can see the boundary of this
 * cluster rather than only its contents.
 *
 * Each of these sits in the same sidebar neighbourhood and shares a verb with
 * this family — `dshmarket` installs plugins, `dsh-better-sidebar` owns the tab
 * band the other plugins fill — and each was declined for a reason that is about
 * the SUBJECT rather than about the words.
 *
 * `dsh-skill-studio` WAS THE THIRD ROW HERE AND IS NOW A FUSED MEMBER. Its
 * refusal and its refutation both live in {@link FUSED_BEYOND_CENSUS} rather than
 * being quietly deleted, because a decline that turns out to be wrong is the most
 * useful row the record can keep.
 */
export const CONSIDERED_NOT_FUSED = [
  {
    member: 'dshmarket',
    why: 'its plugin-management module already wires the dsh-meta-market row (plugins-src/dsh-market/src/client/meta-market-entry.tsx), so it is the market cluster (C7), whose subject is installing and switching plugins rather than evolving capabilities',
    census: 'research/fusion-census.json cluster C7 "Plugin and profile management affordances"',
  },
  {
    member: 'dsh-better-sidebar',
    why: 'band overlap, not intent overlap: it OWNS the right-sidebar tab band that dsh-ide-git and dsh-memory-delta fill, so fusing it would invert the dependency rather than compose two peers',
    census: 'research/fusion-census.json cluster C9 "Right-sidebar tab band, an extension relationship"',
  },
] as const

/**
 * One excluded member, as it appears on the wire.
 *
 * The TYPE is declared even though the list is currently empty: with a bare
 * `[] as const` the element type is `never`, so the client's renderer is asked to
 * read `.reason` off a value the compiler has proven cannot exist — which is how
 * an empty list silently deletes a capability from the UI instead of showing an
 * empty section.
 */
export interface ExcludedMember {
  readonly member: string
  readonly reason: string
}

/** Nothing is excluded today; see {@link CENSUS_ADOPTION} for why the list shrank. */
export const EXCLUDED_MEMBERS: readonly ExcludedMember[] = []

/**
 * THE MEMBERSHIP CHANGE, RECORDED RATHER THAN APPLIED SILENTLY.
 *
 * This lane first read `dsh-recall-console` as NOT SAME-INTENT and excluded it.
 * The census lane's `research/fusion-census.json` (cluster C5, four members,
 * generated 2026-10-26T10:30:00Z) placed it inside the cluster, and the standing
 * instruction is to adopt the census and report the change. Both readings are
 * therefore kept, with the evidence that separated them, because the reason a
 * decision was reversed is part of the decision.
 */
export const CENSUS_ADOPTION = {
  source: 'research/fusion-census.json',
  cluster: 'C5',
  clusterLabel: 'Evolution and recall consoles',
  generatedAt: '2026-10-26T10:30:00Z',
  adoptedAt: '2026-10-26T10:52:00Z',
  was: 'three members: dsh-skill-evolution, dsh-tools-skills-evolve, dsh-evolution-console (dsh-recall-console excluded as not same-intent)',
  now: 'four members: the three above plus dsh-recall-console',
  why: 'the census places dsh-recall-console inside C5 and the standing instruction is to adopt the census when it contradicts a lane\'s provisional reading; its own wording — "the population is shared even though the panel is not" — is a reason to COMPOSE it behind one entry, and this surface composes rather than merges, so nothing the member observes is replaced',
  keptBecause: 'the evidence for the earlier exclusion still stands as a fact about the member: it mutates nothing (its own src/host/index.ts:31-36), so it contributes reachability and posture, not evolution. That is why its seven routes are forwarded read-only and its seat row is recorded as a seat, not as a mechanism',
} as const

/** The ledger's public shape on the wire. */
export interface CapabilityReport {
  readonly id: string
  readonly family: Family
  readonly member: string
  readonly kind: CapabilityKind
  readonly verb: 'GET' | 'POST' | '-'
  readonly fusedPath: string | null
  readonly upstreamPath: string | null
  readonly citation: string
  readonly what: string
  /** `present` = reachable through the fused surface; `unmeasured` = declared gap, never a zero. */
  readonly status: 'present' | 'unmeasured'
  /** The reason, on an unmeasured row. Absent on a present row. */
  readonly reason?: string
}

/** One member's liveness, as observed at this request. */
export interface MemberHealth {
  readonly member: string
  readonly prefix: string
  /** `null` when no probe could be taken — an absence of a READING, not a failure. */
  readonly reachable: boolean | null
  readonly probe: string
  readonly observedStatus: number | null
  readonly reason: string | null
  readonly observedAt: string
}

/** The payload of {@link CAPABILITIES_PATH}. */
export interface CapabilitiesResponse {
  readonly ok: true
  readonly fused: 'dsh-meta-skills'
  readonly prefix: string
  /** The census moment, so no count below is read without its clock. */
  readonly censusAt: string
  readonly capabilities: readonly CapabilityReport[]
  readonly counts: {
    readonly total: number
    readonly present: number
    readonly unmeasured: number
    readonly byKind: { readonly route: number; readonly seat: number; readonly inProcess: number }
  }
  readonly excluded: readonly ExcludedMember[]
  readonly members: readonly MemberHealth[]
}

/** The payload of {@link HEALTH_PATH}. */
export interface HealthResponse {
  readonly ok: true
  readonly fused: 'dsh-meta-skills'
  readonly prefix: string
  readonly censusAt: string
  readonly members: readonly MemberHealth[]
  /** How many members answered a probe, over how many were probed. */
  readonly answered: { readonly count: number; readonly probed: number }
}

/** The body this surface writes when a path is not its own. */
export interface NotFoundResponse {
  readonly ok: false
  readonly fused: 'dsh-meta-skills'
  readonly error: 'unknown meta-skills route'
  /** The path AS RECEIVED, quoted, so the reader can see what missed. */
  readonly path: string
  readonly prefix: string
  /** The only route that explains the surface; a 404 body's job is to be authoritative. */
  readonly see: string
}
