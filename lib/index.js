//#region src/shared/protocol.ts
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
const ROUTE_PREFIX = "/meta-skills";
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
const ROUTE_PATHS = {
	"list": "/api/skills/list",
	"listModels": "/api/skills/listModels",
	"setModel": "/api/skills/setModel",
	"resetModel": "/api/skills/resetModel",
	"setLanguage": "/api/skills/setLanguage",
	"setEnabled": "/api/skills/setEnabled",
	"setTuning": "/api/skills/setTuning",
	"resetTuning": "/api/skills/resetTuning",
	"setPrompt": "/api/skills/setPrompt",
	"get": "/api/skills/get",
	"remove": "/api/skills/remove",
	"clear": "/api/skills/clear",
	"gateStats": "/api/skills/gateStats",
	"audit": "/api/skills/audit",
	"state": "/api/tools/state",
	"knobs": "/api/tools/knobs",
	"registry": "/api/tools/registry",
	"decide": "/api/tools/decide",
	"metaControl": "/api/tools/meta/control",
	"toolControl": "/api/tools/control",
	"toolView": "/api/tools",
	"tools": "/api/recall/tools",
	"tools/select": "/api/recall/tools/select",
	"skills": "/api/recall/skills",
	"skills/recall": "/api/recall/skills/recall",
	"scripts": "/api/recall/scripts",
	"status": "/api/recall/status",
	"recall-events": "/api/recall/recall-events",
	"catalog": "/api/pipeline/catalog",
	"traces": "/api/pipeline/traces",
	"arm": "/api/pipeline/arm",
	"disable": "/api/pipeline/disable",
	"remine": "/api/pipeline/remine",
	"qa": "/api/pipeline/qa",
	"qa/answer": "/api/pipeline/qa/answer",
	"studioState": "/api/studio/state",
	"studioPropose": "/api/studio/propose",
	"studioPromote": "/api/studio/promote",
	"studioRefuse": "/api/studio/refuse",
	"studioRounds": "/api/studio/rounds",
	"studioMembers": "/api/studio/members",
	"studioGrant": "/api/studio/grant"
};
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
const ROUTE_METHODS = {
	"list": "POST",
	"listModels": "POST",
	"setModel": "POST",
	"resetModel": "POST",
	"setLanguage": "POST",
	"setEnabled": "POST",
	"setTuning": "POST",
	"resetTuning": "POST",
	"setPrompt": "POST",
	"get": "POST",
	"remove": "POST",
	"clear": "POST",
	"gateStats": "POST",
	"audit": "POST",
	"state": "GET",
	"knobs": "POST",
	"registry": "GET",
	"decide": "POST",
	"metaControl": "POST",
	"toolControl": "POST",
	"toolView": "GET",
	"tools": "GET",
	"tools/select": "POST",
	"skills": "GET",
	"skills/recall": "POST",
	"scripts": "GET",
	"status": "GET",
	"recall-events": "GET",
	"catalog": "GET",
	"traces": "GET",
	"arm": "POST",
	"disable": "POST",
	"remine": "POST",
	"qa": "GET",
	"qa/answer": "POST",
	"studioState": "GET",
	"studioPropose": "POST",
	"studioPromote": "POST",
	"studioRefuse": "POST",
	"studioRounds": "GET",
	"studioMembers": "GET",
	"studioGrant": "POST"
};
/** The ledger route: what the fused surface claims to absorb, with live status. */
const CAPABILITIES_PATH = "/api/capabilities";
/** The liveness route: one probe per member, with the probe's own clock. */
const HEALTH_PATH = "/api/health";
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
const FAMILIES = {
	skills: {
		family: "skills",
		member: "dsh-skill-evolution",
		fusedBase: "/api/skills",
		upstreamBase: "/skill-evolution",
		/** The member's channel speaks the harness RPC envelope, so the path carries the method. */
		wire: "envelope"
	},
	tools: {
		family: "tools",
		member: "dsh-tools-skills-evolve",
		fusedBase: "/api/tools",
		upstreamBase: "/tools-skills-evolve/api",
		wire: "json"
	},
	recall: {
		family: "recall",
		member: "dsh-recall-console",
		fusedBase: "/api/recall",
		upstreamBase: "/recall-console/api",
		wire: "json"
	},
	pipeline: {
		family: "pipeline",
		member: "dsh-evolution-console",
		fusedBase: "/api/pipeline",
		upstreamBase: "/evolution/api",
		wire: "json"
	},
	studio: {
		family: "studio",
		member: "dsh-skill-studio",
		fusedBase: "/api/studio",
		upstreamBase: "/skill-studio/api",
		wire: "json"
	}
};
/**
* The ledger. Built by ENUMERATION of the members' own dispatch tables, not by
* reading their prose: the fourteen channel methods are the `switch (endpoint)`
* cases at `plugin.mjs:1809-1971`, the five gate routes are the `ROUTE_PATHS`
* comparisons at `src/host/routes.ts:218-251`, and the seven pipeline routes are
* the `route ===` comparisons at `src/host/routes.ts:183-215`.
*/
const CAPABILITIES = [
	{
		id: "skills.rpc.list",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/skills/list",
		upstreamPath: "/skill-evolution/list",
		citation: "plugin.mjs:1809",
		citedToken: "case 'list':",
		wire: "envelope",
		unmeasuredReason: null,
		what: "the evolved-skill list, the live catalog snapshot, the initial-prompt selection records and the config/stats blocks"
	},
	{
		id: "skills.rpc.listModels",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/skills/listModels",
		upstreamPath: "/skill-evolution/listModels",
		citation: "plugin.mjs:1833",
		citedToken: "case 'listModels':",
		wire: "envelope",
		unmeasuredReason: null,
		what: "the reviewer-model roster: providers and their models, read from the host LLM service"
	},
	{
		id: "skills.rpc.setModel",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/skills/setModel",
		upstreamPath: "/skill-evolution/setModel",
		citation: "plugin.mjs:1853",
		citedToken: "case 'setModel':",
		wire: "envelope",
		unmeasuredReason: null,
		what: "persist the reviewer provider/model into the member runtime config"
	},
	{
		id: "skills.rpc.resetModel",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/skills/resetModel",
		upstreamPath: "/skill-evolution/resetModel",
		citation: "plugin.mjs:1874",
		citedToken: "case 'resetModel':",
		wire: "envelope",
		unmeasuredReason: null,
		what: "drop the reviewer override and return to the deployment default model"
	},
	{
		id: "skills.rpc.setLanguage",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/skills/setLanguage",
		upstreamPath: "/skill-evolution/setLanguage",
		citation: "plugin.mjs:1881",
		citedToken: "case 'setLanguage':",
		wire: "envelope",
		unmeasuredReason: null,
		what: "set the language the crystallized skill bodies are written in"
	},
	{
		id: "skills.rpc.setEnabled",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/skills/setEnabled",
		upstreamPath: "/skill-evolution/setEnabled",
		citation: "plugin.mjs:1889",
		citedToken: "case 'setEnabled':",
		wire: "envelope",
		unmeasuredReason: null,
		what: "switch the trace observer on or off for this process"
	},
	{
		id: "skills.rpc.setTuning",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/skills/setTuning",
		upstreamPath: "/skill-evolution/setTuning",
		citation: "plugin.mjs:1896",
		citedToken: "case 'setTuning':",
		wire: "envelope",
		unmeasuredReason: null,
		what: "the eleven crystallization thresholds (minTraceSteps, minSuccessRate, maxEvolvedSkills, improvementEvery, …)"
	},
	{
		id: "skills.rpc.resetTuning",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/skills/resetTuning",
		upstreamPath: "/skill-evolution/resetTuning",
		citation: "plugin.mjs:1906",
		citedToken: "case 'resetTuning':",
		wire: "envelope",
		unmeasuredReason: null,
		what: "restore every crystallization threshold to its shipped default"
	},
	{
		id: "skills.rpc.setPrompt",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/skills/setPrompt",
		upstreamPath: "/skill-evolution/setPrompt",
		citation: "plugin.mjs:1912",
		citedToken: "case 'setPrompt':",
		wire: "envelope",
		unmeasuredReason: null,
		what: "replace the reviewer prompt that decides whether a trace crystallizes"
	},
	{
		id: "skills.rpc.get",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/skills/get",
		upstreamPath: "/skill-evolution/get",
		citation: "plugin.mjs:1923",
		citedToken: "case 'get':",
		wire: "envelope",
		unmeasuredReason: null,
		what: "one crystallized skill record by name, with its evidence and version history"
	},
	{
		id: "skills.rpc.remove",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/skills/remove",
		upstreamPath: "/skill-evolution/remove",
		citation: "plugin.mjs:1929",
		citedToken: "case 'remove':",
		wire: "envelope",
		unmeasuredReason: null,
		what: "unregister and delete one crystallized skill"
	},
	{
		id: "skills.rpc.clear",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/skills/clear",
		upstreamPath: "/skill-evolution/clear",
		citation: "plugin.mjs:1945",
		citedToken: "case 'clear':",
		wire: "envelope",
		unmeasuredReason: null,
		what: "unregister and delete every crystallized skill in one operation"
	},
	{
		id: "skills.rpc.gateStats",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/skills/gateStats",
		upstreamPath: "/skill-evolution/gateStats",
		citation: "plugin.mjs:1965",
		citedToken: "case 'gateStats':",
		wire: "envelope",
		unmeasuredReason: null,
		what: "the promotion gate census: proceed / held / abstained / unavailable counts with their denominators"
	},
	{
		id: "skills.rpc.audit",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/skills/audit",
		upstreamPath: "/skill-evolution/audit",
		citation: "plugin.mjs:1971",
		citedToken: "case 'audit':",
		wire: "envelope",
		unmeasuredReason: null,
		what: "the crystallization audit trail, one row per evaluated turn"
	},
	{
		id: "skills.seat.settings",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "seat",
		verb: "-",
		fusedPath: null,
		upstreamPath: null,
		citation: "client.js:891",
		citedToken: "settings.section",
		wire: null,
		unmeasuredReason: null,
		what: "the member's own settings.section (id skill-evolution, order 300), replaced on the fused surface by the one meta-skills entry whose Skills tab reaches all fourteen methods above"
	},
	{
		id: "skills.service.skillSelection",
		family: "skills",
		member: "dsh-skill-evolution",
		kind: "in-process",
		verb: "-",
		fusedPath: null,
		upstreamPath: null,
		citation: "plugin.mjs:2481",
		citedToken: "ctx.provide('skillSelection'",
		wire: null,
		unmeasuredReason: "IN-PROCESS ONLY: the member publishes `ctx.skillSelection` to other plugins, not over HTTP, so a composing surface cannot serve it and this ledger will not claim it does — the member stays loaded (D-0352 rule 3) and still publishes it",
		what: "a read-only accessor over the selection records, for mount-time callers that cannot reach the RPC channel"
	},
	{
		id: "tools.state",
		family: "tools",
		member: "dsh-tools-skills-evolve",
		kind: "route",
		verb: "GET",
		fusedPath: "/api/tools/state",
		upstreamPath: "/tools-skills-evolve/api/state",
		citation: "src/host/routes.ts:227",
		citedToken: "ROUTE_PATHS.state",
		wire: "json",
		unmeasuredReason: null,
		what: "the graded proposal queue, the knob values in force, the promotion rule and the ledger census"
	},
	{
		id: "tools.knobs",
		family: "tools",
		member: "dsh-tools-skills-evolve",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/tools/knobs",
		upstreamPath: "/tools-skills-evolve/api/knobs",
		citation: "src/host/routes.ts:233",
		citedToken: "ROUTE_PATHS.knobs",
		wire: "json",
		unmeasuredReason: null,
		what: "set a gate knob and RE-GRADE the queue, reporting which verdicts moved"
	},
	{
		id: "tools.registry",
		family: "tools",
		member: "dsh-tools-skills-evolve",
		kind: "route",
		verb: "GET",
		fusedPath: "/api/tools/registry",
		upstreamPath: "/tools-skills-evolve/api/registry",
		citation: "src/host/routes.ts:244",
		citedToken: "ROUTE_PATHS.registry",
		wire: "json",
		unmeasuredReason: null,
		what: "the live tool declarations the proposals are derived from, with their token cost"
	},
	{
		id: "tools.decide",
		family: "tools",
		member: "dsh-tools-skills-evolve",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/tools/decide",
		upstreamPath: "/tools-skills-evolve/api/decide",
		citation: "src/host/routes.ts:261",
		citedToken: "ROUTE_PATHS.decide",
		wire: "json",
		unmeasuredReason: null,
		what: "apply the Q1-Q7 grader to one proposal and record the decision in the append-only ledger"
	},
	{
		id: "tools.metaControl",
		family: "tools",
		member: "dsh-tools-skills-evolve",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/tools/meta/control",
		upstreamPath: "/tools-skills-evolve/api/meta/control",
		citation: "src/host/routes.ts:249",
		citedToken: "ROUTE_PATHS.metaControl",
		wire: "json",
		unmeasuredReason: null,
		what: "control the two meta artifacts (skill + tool) the loop acts on"
	},
	{
		id: "tools.toolControl",
		family: "tools",
		member: "dsh-tools-skills-evolve",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/tools/control",
		upstreamPath: "/tools-skills-evolve/api/tools/control",
		citation: "src/host/routes.ts:284",
		citedToken: "ROUTE_PATHS.toolControl",
		wire: "json",
		unmeasuredReason: null,
		what: "deny or allow ONE tool for the live tools service and report the guard census; the denial is the dispatch decision"
	},
	{
		id: "tools.toolView",
		family: "tools",
		member: "dsh-tools-skills-evolve",
		kind: "route",
		verb: "GET",
		fusedPath: "/api/tools",
		upstreamPath: "/tools-skills-evolve/api/tools",
		citation: "src/host/routes.ts:283",
		citedToken: "ROUTE_PATHS.toolView",
		wire: "json",
		unmeasuredReason: null,
		what: "read the denied tool set, the verdicts and whether a guard is registered at all"
	},
	{
		id: "tools.seat.panel",
		family: "tools",
		member: "dsh-tools-skills-evolve",
		kind: "seat",
		verb: "-",
		fusedPath: null,
		upstreamPath: null,
		citation: "src/client/index.tsx:123",
		citedToken: "name: 'main'",
		wire: null,
		unmeasuredReason: null,
		what: "the member's keyed main panel plus its sidebar.panellist row (src/client/index.tsx:136), replaced on the fused surface by the one meta-skills entry whose Gate tab reaches the five routes above"
	},
	{
		id: "pipeline.catalog",
		family: "pipeline",
		member: "dsh-evolution-console",
		kind: "route",
		verb: "GET",
		fusedPath: "/api/pipeline/catalog",
		upstreamPath: "/evolution/api/catalog",
		citation: "src/host/routes.ts:183",
		citedToken: "route === 'catalog'",
		wire: "json",
		unmeasuredReason: null,
		what: "the mined capability candidates joined to the arm/disable state, with unmeasured values named as such"
	},
	{
		id: "pipeline.traces",
		family: "pipeline",
		member: "dsh-evolution-console",
		kind: "route",
		verb: "GET",
		fusedPath: "/api/pipeline/traces",
		upstreamPath: "/evolution/api/traces",
		citation: "src/host/routes.ts:189",
		citedToken: "route === 'traces'",
		wire: "json",
		unmeasuredReason: null,
		what: "the failure clusters and scan scope of the trace corpus the candidates were mined from"
	},
	{
		id: "pipeline.arm",
		family: "pipeline",
		member: "dsh-evolution-console",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/pipeline/arm",
		upstreamPath: "/evolution/api/arm",
		citation: "src/host/routes.ts:195",
		citedToken: "route === 'arm'",
		wire: "json",
		unmeasuredReason: null,
		what: "arm one mined candidate (the console is the only writer of evolution/state.json)"
	},
	{
		id: "pipeline.disable",
		family: "pipeline",
		member: "dsh-evolution-console",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/pipeline/disable",
		upstreamPath: "/evolution/api/disable",
		citation: "src/host/routes.ts:195",
		citedToken: "route === 'disable'",
		wire: "json",
		unmeasuredReason: null,
		what: "disable one mined candidate, same writer, same audit"
	},
	{
		id: "pipeline.remine",
		family: "pipeline",
		member: "dsh-evolution-console",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/pipeline/remine",
		upstreamPath: "/evolution/api/remine",
		citation: "src/host/routes.ts:203",
		citedToken: "route === 'remine'",
		wire: "json",
		unmeasuredReason: null,
		what: "re-mine and report the census timestamp BEFORE and AFTER"
	},
	{
		id: "pipeline.qa",
		family: "pipeline",
		member: "dsh-evolution-console",
		kind: "route",
		verb: "GET",
		fusedPath: "/api/pipeline/qa",
		upstreamPath: "/evolution/api/qa",
		citation: "src/host/routes.ts:209",
		citedToken: "route === 'qa'",
		wire: "json",
		unmeasuredReason: null,
		what: "the operator Q&A items and their recorded verdicts"
	},
	{
		id: "pipeline.qaAnswer",
		family: "pipeline",
		member: "dsh-evolution-console",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/pipeline/qa/answer",
		upstreamPath: "/evolution/api/qa/answer",
		citation: "src/host/routes.ts:215",
		citedToken: "route === 'qa/answer'",
		wire: "json",
		unmeasuredReason: null,
		what: "record an operator verdict on one Q&A item"
	},
	{
		id: "pipeline.seat.settings",
		family: "pipeline",
		member: "dsh-evolution-console",
		kind: "seat",
		verb: "-",
		fusedPath: null,
		upstreamPath: null,
		citation: "src/client/index.tsx:40",
		citedToken: "'settings.section'",
		wire: null,
		unmeasuredReason: null,
		what: "the console's own settings.section (id evolution-console, order 30), replaced on the fused surface by the one meta-skills entry whose Pipeline tab reaches the seven routes above"
	},
	{
		id: "recall.tools",
		family: "recall",
		member: "dsh-recall-console",
		kind: "route",
		verb: "GET",
		fusedPath: "/api/recall/tools",
		upstreamPath: "/recall-console/api/tools",
		citation: "src/host/routes.ts:179",
		citedToken: "route === 'tools'",
		wire: "json",
		unmeasuredReason: null,
		what: "the tool recall posture: which of delivered / absent / blocked each tool kind is in, and the evidence for it"
	},
	{
		id: "recall.toolsSelect",
		family: "recall",
		member: "dsh-recall-console",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/recall/tools/select",
		upstreamPath: "/recall-console/api/tools/select",
		citation: "src/host/routes.ts:185",
		citedToken: "route === 'tools/select'",
		wire: "json",
		unmeasuredReason: null,
		what: "select the tools that answer one stated intent, by exact name against the enumerable registry"
	},
	{
		id: "recall.skills",
		family: "recall",
		member: "dsh-recall-console",
		kind: "route",
		verb: "GET",
		fusedPath: "/api/recall/skills",
		upstreamPath: "/recall-console/api/skills",
		citation: "src/host/routes.ts:194",
		citedToken: "route === 'skills'",
		wire: "json",
		unmeasuredReason: null,
		what: "the skill recall posture over the injected skill catalog"
	},
	{
		id: "recall.skillsRecall",
		family: "recall",
		member: "dsh-recall-console",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/recall/skills/recall",
		upstreamPath: "/recall-console/api/skills/recall",
		citation: "src/host/routes.ts:200",
		citedToken: "route === 'skills/recall'",
		wire: "json",
		unmeasuredReason: null,
		what: "semantic skill recall for one query, through the member's own retriever"
	},
	{
		id: "recall.scripts",
		family: "recall",
		member: "dsh-recall-console",
		kind: "route",
		verb: "GET",
		fusedPath: "/api/recall/scripts",
		upstreamPath: "/recall-console/api/scripts",
		citation: "src/host/routes.ts:209",
		citedToken: "route === 'scripts'",
		wire: "json",
		unmeasuredReason: null,
		what: "the script posture, which the member reports as a kind with no agreed referent rather than as a zero"
	},
	{
		id: "recall.status",
		family: "recall",
		member: "dsh-recall-console",
		kind: "route",
		verb: "GET",
		fusedPath: "/api/recall/status",
		upstreamPath: "/recall-console/api/status",
		citation: "src/host/routes.ts:215",
		citedToken: "route === 'status'",
		wire: "json",
		unmeasuredReason: null,
		what: "the cross-kind status census"
	},
	{
		id: "recall.recallEvents",
		family: "recall",
		member: "dsh-recall-console",
		kind: "route",
		verb: "GET",
		fusedPath: "/api/recall/recall-events",
		upstreamPath: "/recall-console/api/recall-events",
		citation: "src/host/routes.ts:221",
		citedToken: "route === 'recall-events'",
		wire: "json",
		unmeasuredReason: null,
		what: "the observed recall events"
	},
	{
		id: "recall.seat.settings",
		family: "recall",
		member: "dsh-recall-console",
		kind: "seat",
		verb: "-",
		fusedPath: null,
		upstreamPath: null,
		citation: "src/client/index.tsx:43",
		citedToken: "'recall-console'",
		wire: null,
		unmeasuredReason: null,
		what: "the console's own settings.section (id recall-console, order 35), replaced on the fused surface by the one meta-skills entry whose Recall tab reaches the seven routes above"
	},
	{
		id: "studio.state",
		family: "studio",
		member: "dsh-skill-studio",
		kind: "route",
		verb: "GET",
		fusedPath: "/api/studio/state",
		upstreamPath: "/skill-studio/api/state",
		citation: "src/host/routes.ts:476",
		citedToken: "ROUTE_PATHS[0]",
		wire: "json",
		unmeasuredReason: null,
		what: "the catalog the model can actually see (decomposed into scanned-root and plugin-snapshot counts), what is staged with its four-criterion grade, what is promoted and whether the catalog LISTS it, the round census, and the per-member fleet with its grant table — with `null` where a source was NOT READ, never 0"
	},
	{
		id: "studio.propose",
		family: "studio",
		member: "dsh-skill-studio",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/studio/propose",
		upstreamPath: "/skill-studio/api/propose",
		citation: "src/host/routes.ts:505",
		citedToken: "ROUTE_PATHS[1]",
		wire: "json",
		unmeasuredReason: null,
		what: "stage a candidate under state/skill-staging/ (invisible to the model), graded on write, labelled deterministic-fallback because this member has no LLM adapter, with catalogBefore/catalogAfter written to the round ledger"
	},
	{
		id: "studio.promote",
		family: "studio",
		member: "dsh-skill-studio",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/studio/promote",
		upstreamPath: "/skill-studio/api/promote",
		citation: "src/host/routes.ts:543",
		citedToken: "ROUTE_PATHS[2]",
		wire: "json",
		unmeasuredReason: null,
		what: "the atomic rename out of staging into the SCANNED root .agents/skills/, refused unless the four-criterion grade passed, reporting whether the visible catalog count actually moved and warning when the directory is present but unlisted"
	},
	{
		id: "studio.refuse",
		family: "studio",
		member: "dsh-skill-studio",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/studio/refuse",
		upstreamPath: "/skill-studio/api/refuse",
		citation: "src/host/routes.ts:590",
		citedToken: "ROUTE_PATHS[3]",
		wire: "json",
		unmeasuredReason: null,
		what: "record a refusal WITH its reason in the append-only round ledger, carrying the catalog reading on both sides so \"refused and nothing moved\" is distinguishable from \"refused and something else changed it\""
	},
	{
		id: "studio.rounds",
		family: "studio",
		member: "dsh-skill-studio",
		kind: "route",
		verb: "GET",
		fusedPath: "/api/studio/rounds",
		upstreamPath: "/skill-studio/api/rounds",
		citation: "src/host/routes.ts:499",
		citedToken: "ROUTE_PATHS[4]",
		wire: "json",
		unmeasuredReason: null,
		what: "the append-only round ledger newest-first, with a COUNT of malformed lines rather than a silent drop"
	},
	{
		id: "studio.members",
		family: "studio",
		member: "dsh-skill-studio",
		kind: "route",
		verb: "GET",
		fusedPath: "/api/studio/members",
		upstreamPath: "/skill-studio/api/members",
		citation: "src/host/routes.ts:483",
		citedToken: "ROUTE_PATHS[5]",
		wire: "json",
		unmeasuredReason: null,
		what: "the live member census: each member's OWN catalog resolved through that member's own scope, the folded grant table, and members: [] with a non-null reason when the census could NOT be taken — a different fact from an empty fleet"
	},
	{
		id: "studio.grant",
		family: "studio",
		member: "dsh-skill-studio",
		kind: "route",
		verb: "POST",
		fusedPath: "/api/studio/grant",
		upstreamPath: "/skill-studio/api/grant",
		citation: "src/host/routes.ts:616",
		citedToken: "ROUTE_PATHS[6]",
		wire: "json",
		unmeasuredReason: null,
		what: "set or lift a per-member skill mask through `member.ctx.get(\"skills\").restrict({ deny: [skill] })` (members.ts:202), then RE-READ the catalog of the subject so the answer is an outcome that moved rather than a value the caller wrote back; an unattributed grant is refused, because a grant with no `by` is a rumour with a timestamp"
	},
	{
		id: "studio.seat.panel",
		family: "studio",
		member: "dsh-skill-studio",
		kind: "seat",
		verb: "-",
		fusedPath: null,
		upstreamPath: null,
		citation: "src/client/index.ts:94",
		citedToken: "'dsh-skill-studio:studio'",
		wire: null,
		unmeasuredReason: null,
		what: "the studio's own sidebar.panellist row (id dsh-skill-studio:studio, order 6.6 at src/client/index.ts:99) plus its keyed main panel, replaced on the fused surface by the one meta-skills entry whose Studio tab reaches the seven routes above"
	}
];
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
const FUSED_BEYOND_CENSUS = [{
	member: "dsh-skill-studio",
	decision: "D-0357",
	decidedAt: "2026-10-26T12:11:45.642Z",
	census: "none: research/fusion-census.json contains zero occurrences of \"skill-studio\"",
	what: "the stage -> grade -> promote studio over the SCANNED skill root, plus the per-member skill mask; seven routes under /skill-studio/api and one sidebar row at order 6.6",
	why: "the surface answers the SAME question this family already composes — which skills the model can see and select — and differs only in WRITE TARGET (on-disk scanned root + per-member mask, versus the runtime registry), so it is a third write mode of one subject rather than a rival surface",
	refusedBy: "this ledger, in an earlier revision, as \"same VERB (grant a skill) and a different SUBJECT\"; refuted on its own evidence (see the block comment above) and on the reading of the owner",
	ownerWording: "\"Skills&tools\" & \"Skills&Evolution\" & \"Skill studio\" are not fused."
}];
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
const CONSIDERED_NOT_FUSED = [{
	member: "dshmarket",
	why: "its plugin-management module already wires the dsh-meta-market row (plugins-src/dsh-market/src/client/meta-market-entry.tsx), so it is the market cluster (C7), whose subject is installing and switching plugins rather than evolving capabilities",
	census: "research/fusion-census.json cluster C7 \"Plugin and profile management affordances\""
}, {
	member: "dsh-better-sidebar",
	why: "band overlap, not intent overlap: it OWNS the right-sidebar tab band that dsh-ide-git and dsh-memory-delta fill, so fusing it would invert the dependency rather than compose two peers",
	census: "research/fusion-census.json cluster C9 \"Right-sidebar tab band, an extension relationship\""
}];
/** Nothing is excluded today; see {@link CENSUS_ADOPTION} for why the list shrank. */
const EXCLUDED_MEMBERS = [];
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
const CENSUS_ADOPTION = {
	source: "research/fusion-census.json",
	cluster: "C5",
	clusterLabel: "Evolution and recall consoles",
	generatedAt: "2026-10-26T10:30:00Z",
	adoptedAt: "2026-10-26T10:52:00Z",
	was: "three members: dsh-skill-evolution, dsh-tools-skills-evolve, dsh-evolution-console (dsh-recall-console excluded as not same-intent)",
	now: "four members: the three above plus dsh-recall-console",
	why: "the census places dsh-recall-console inside C5 and the standing instruction is to adopt the census when it contradicts a lane's provisional reading; its own wording — \"the population is shared even though the panel is not\" — is a reason to COMPOSE it behind one entry, and this surface composes rather than merges, so nothing the member observes is replaced",
	keptBecause: "the evidence for the earlier exclusion still stands as a fact about the member: it mutates nothing (its own src/host/index.ts:31-36), so it contributes reachability and posture, not evolution. That is why its seven routes are forwarded read-only and its seat row is recorded as a seat, not as a mechanism"
};
//#endregion
//#region src/host/proxy.ts
/** Raised when the member could not be reached at all. Distinct from "it refused". */
var UpstreamUnreachable = class extends Error {
	/** The upstream URL this process tried to reach. */
	target;
	constructor(target, cause) {
		super(`upstream ${target} could not be reached: ${cause instanceof Error ? cause.message : String(cause)}`);
		this.name = "UpstreamUnreachable";
		this.target = target;
	}
};
/**
* Headers a new request must not inherit.
*
* `content-length` is in the list even though it is not hop-by-hop in the RFC
* sense: `fetch` sets it from the body it is given, and a copied value would
* either be stale or make the body look truncated.
*/
const DROPPED_HEADERS = /* @__PURE__ */ new Set([
	"host",
	"content-length",
	"connection",
	"keep-alive",
	"transfer-encoding",
	"upgrade",
	"expect",
	"te",
	"trailer",
	"proxy-authorization",
	"proxy-connection"
]);
/** Read the whole request body into one buffer, bounded by nothing but the member's own cap. */
async function readBody(req) {
	const chunks = [];
	for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
	return Buffer.concat(chunks);
}
/** Copy the request's headers into a forwardable record. */
function forwardableHeaders(req) {
	const out = {};
	for (const [name, value] of Object.entries(req.headers)) {
		if (value === void 0) continue;
		if (DROPPED_HEADERS.has(name.toLowerCase())) continue;
		out[name] = Array.isArray(value) ? value.join(", ") : value;
	}
	return out;
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
function resolveOrigin(req, override) {
	if (override !== void 0 && override !== "") return override.replace(/\/+$/, "");
	const host = req.headers.host;
	if (host === void 0 || host === "") throw new UpstreamUnreachable("(no Host header)", "a request with no Host header cannot name the deployment to forward to");
	return `http://${host}`;
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
async function forward(req, target, body, timeoutMs) {
	const method = (req.method ?? "GET").toUpperCase();
	const headers = forwardableHeaders(req);
	let response;
	try {
		response = await fetch(target, {
			method,
			headers,
			body: method === "GET" || method === "HEAD" || body.length === 0 ? void 0 : new Uint8Array(body),
			redirect: "manual",
			signal: AbortSignal.timeout(timeoutMs)
		});
	} catch (error) {
		throw new UpstreamUnreachable(target, error);
	}
	const buffer = Buffer.from(await response.arrayBuffer());
	return {
		status: response.status,
		body: buffer,
		contentType: response.headers.get("content-type")
	};
}
//#endregion
//#region src/host/capabilities.ts
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
const PROBES = [
	{
		member: FAMILIES.skills.member,
		family: "skills",
		method: "POST",
		path: `${FAMILIES.skills.upstreamBase}/gateStats`,
		body: JSON.stringify({
			type: "client-request",
			rpcId: "meta-skills-probe",
			method: "gateStats",
			payload: { args: {} }
		}),
		why: "plugin.mjs:1965 (`case 'gateStats'`) — a read-only census; the channel 404s both an unknown endpoint and a non-POST, so a GET cannot tell \"refused\" from \"absent\""
	},
	{
		member: FAMILIES.tools.member,
		family: "tools",
		method: "GET",
		path: `${FAMILIES.tools.upstreamBase}/state`,
		body: null,
		why: "src/host/routes.ts:218 (`ROUTE_PATHS.state`) — an unknown path is the only 404 this member has"
	},
	{
		member: FAMILIES.recall.member,
		family: "recall",
		method: "GET",
		path: `${FAMILIES.recall.upstreamBase}/status`,
		body: null,
		why: "src/host/routes.ts:215 (`route === 'status'`) — a read-only posture census; every recall route sits behind the same prefix, so a 404 here means the member is not mounted"
	},
	{
		member: FAMILIES.pipeline.member,
		family: "pipeline",
		method: "GET",
		path: `${FAMILIES.pipeline.upstreamBase}/catalog`,
		body: null,
		why: "src/host/routes.ts:183 (`route === 'catalog'`) — an unknown path is the only 404 this member has"
	},
	{
		member: FAMILIES.studio.member,
		family: "studio",
		method: "GET",
		path: `${FAMILIES.studio.upstreamBase}/state`,
		body: null,
		why: "src/host/routes.ts:476 (`path === ROUTE_PATHS[0]`; `STATE_PATH = ROUTE_PATHS[0]` at :107) — read-only and writes nothing, and the only 404 this member has is its own final sendJson, so a 404 here means the prefix is not mounted"
	}
];
/** The origin one family forwards to. */
function baseFor$1(config, family, req) {
	return resolveOrigin(req, config.familyBases?.[family] ?? config.upstreamBase);
}
/**
* Probe every member once, at this request.
*
* @param req - the incoming request, used for the origin AND for its cookie.
* @param config - the plugin's configuration.
* @returns one health row per member, in `PROBES` order.
*/
async function probeMembers(req, config) {
	const observedAt = (/* @__PURE__ */ new Date()).toISOString();
	const timeoutMs = config.timeoutMs ?? 8e3;
	return await Promise.all(PROBES.map(async (probe) => {
		let target;
		try {
			target = `${baseFor$1(config, probe.family, req)}${probe.path}`;
		} catch (error) {
			return {
				member: probe.member,
				prefix: probe.path,
				reachable: null,
				probe: `${probe.method} ${probe.path}`,
				observedStatus: null,
				reason: `no reading: ${error instanceof Error ? error.message : String(error)} (${probe.why})`,
				observedAt
			};
		}
		try {
			const response = await fetch(target, {
				method: probe.method,
				headers: {
					...forwardableHeaders(req),
					"content-type": "application/json"
				},
				body: probe.body === null ? void 0 : probe.body,
				redirect: "manual",
				signal: AbortSignal.timeout(timeoutMs)
			});
			await response.arrayBuffer();
			const reachable = response.status !== 404;
			return {
				member: probe.member,
				prefix: probe.path,
				reachable,
				probe: `${probe.method} ${probe.path}`,
				observedStatus: response.status,
				reason: reachable ? null : `probe answered 404, which for ${probe.member} means the prefix is not mounted at this origin (${probe.why})`,
				observedAt
			};
		} catch (error) {
			return {
				member: probe.member,
				prefix: probe.path,
				reachable: null,
				probe: `${probe.method} ${probe.path}`,
				observedStatus: null,
				reason: `no reading: ${error instanceof Error ? error.message : String(error)} (${probe.why})`,
				observedAt
			};
		}
	}));
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
function buildCapabilities(members) {
	const health = new Map(members.map((member) => [member.member, member]));
	const capabilities = CAPABILITIES.map((capability) => {
		const base = {
			id: capability.id,
			family: capability.family,
			member: capability.member,
			kind: capability.kind,
			verb: capability.verb,
			fusedPath: capability.fusedPath === null ? null : `${ROUTE_PREFIX}${capability.fusedPath}`,
			upstreamPath: capability.upstreamPath,
			citation: capability.citation,
			what: capability.what
		};
		if (capability.unmeasuredReason !== null) return {
			...base,
			status: "unmeasured",
			reason: capability.unmeasuredReason
		};
		const member = health.get(capability.member);
		if (member === void 0) return {
			...base,
			status: "unmeasured",
			reason: "no probe was taken for this member at this request"
		};
		if (member.reachable !== true) return {
			...base,
			status: "unmeasured",
			reason: member.reason ?? `member ${capability.member} did not answer a probe at ${member.observedAt}`
		};
		return {
			...base,
			status: "present"
		};
	});
	const present = capabilities.filter((capability) => capability.status === "present").length;
	const unmeasured = capabilities.filter((capability) => capability.status === "unmeasured").length;
	if (present + unmeasured !== capabilities.length) throw new Error(`meta-skills capability census does not close: ${present} present + ${unmeasured} unmeasured != ${capabilities.length} total`);
	return {
		ok: true,
		fused: "dsh-meta-skills",
		prefix: ROUTE_PREFIX,
		censusAt: (/* @__PURE__ */ new Date()).toISOString(),
		capabilities,
		counts: {
			total: capabilities.length,
			present,
			unmeasured,
			byKind: {
				route: capabilities.filter((capability) => capability.kind === "route").length,
				seat: capabilities.filter((capability) => capability.kind === "seat").length,
				inProcess: capabilities.filter((capability) => capability.kind === "in-process").length
			}
		},
		excluded: EXCLUDED_MEMBERS,
		members
	};
}
//#endregion
//#region src/host/routes.ts
/** Write one JSON body, with the content type every route here uses. */
function writeJson(res, status, body) {
	const text = JSON.stringify(body);
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"content-length": Buffer.byteLength(text),
		"cache-control": "no-store"
	});
	res.end(text);
}
/** Write this plugin's own 404 body. */
function writeNotFound(res, pathname) {
	writeJson(res, 404, {
		ok: false,
		fused: "dsh-meta-skills",
		error: "unknown meta-skills route",
		path: pathname,
		prefix: ROUTE_PREFIX,
		see: `${ROUTE_PREFIX}${CAPABILITIES_PATH}`
	});
}
/** A segment the skill channel's own pattern would accept, so `..` cannot walk out. */
const ENDPOINT_PATTERN = /^[A-Za-z][A-Za-z0-9/._-]*$/;
/**
* Build the prefix handler.
*
* @param config - the plugin's configuration (upstream overrides, timeouts).
* @returns a handler for `ctx.webServer.register({ kind: 'prefix' })`.
*/
function createRouteHandler(config) {
	return async (req, res) => {
		const url = new URL(req.url ?? "/", "http://dsh.invalid");
		const pathname = url.pathname;
		if (!pathname.startsWith("/meta-skills")) {
			writeNotFound(res, pathname);
			return;
		}
		const rest = pathname.slice(12) || "/";
		const method = (req.method ?? "GET").toUpperCase();
		try {
			if (rest === "/api/capabilities") {
				if (method !== "GET") {
					writeJson(res, 405, {
						ok: false,
						fused: "dsh-meta-skills",
						error: "method not allowed",
						route: `${ROUTE_PREFIX}${CAPABILITIES_PATH}`,
						received: method
					});
					return;
				}
				writeJson(res, 200, buildCapabilities(await probeMembers(req, config)));
				return;
			}
			if (rest === "/api/health") {
				if (method !== "GET") {
					writeJson(res, 405, {
						ok: false,
						fused: "dsh-meta-skills",
						error: "method not allowed",
						route: `${ROUTE_PREFIX}${HEALTH_PATH}`,
						received: method
					});
					return;
				}
				const members = await probeMembers(req, config);
				const answered = members.filter((member) => member.reachable === true).length;
				writeJson(res, 200, {
					ok: true,
					fused: "dsh-meta-skills",
					prefix: ROUTE_PREFIX,
					censusAt: (/* @__PURE__ */ new Date()).toISOString(),
					members,
					answered: {
						count: answered,
						probed: members.length
					}
				});
				return;
			}
			const declared = typeof rest === "string" ? Object.entries(ROUTE_PATHS).find(([, path]) => path === rest) : void 0;
			if (rest !== "/api/capabilities" && rest !== "/api/health" && declared === void 0) {
				writeNotFound(res, pathname);
				return;
			}
			if (declared !== void 0 && declared[1].startsWith(`${FAMILIES.skills.fusedBase}/`)) {
				const endpoint = declared[1].slice(FAMILIES.skills.fusedBase.length + 1);
				if (!ENDPOINT_PATTERN.test(endpoint)) {
					writeJson(res, 400, {
						ok: false,
						fused: "dsh-meta-skills",
						error: "bad endpoint segment",
						endpoint,
						see: `${ROUTE_PREFIX}${CAPABILITIES_PATH}`
					});
					return;
				}
				if (method !== "POST") {
					writeJson(res, 405, {
						ok: false,
						fused: "dsh-meta-skills",
						error: "method not allowed",
						route: `${ROUTE_PREFIX}${FAMILIES.skills.fusedBase}/${endpoint}`,
						received: method,
						hint: "the skill channel is POST with an RPC envelope"
					});
					return;
				}
				const body = await readBody(req);
				const answer = await forward(req, `${baseFor(config, "skills", req)}${FAMILIES.skills.upstreamBase}/${endpoint}${url.search}`, body, config.timeoutMs ?? 15e3);
				writeForwarded(res, answer.status, answer.body, answer.contentType);
				return;
			}
			for (const family of [
				"tools",
				"recall",
				"pipeline",
				"studio"
			]) {
				const fusedBase = FAMILIES[family].fusedBase;
				if (declared === void 0 || declared[1] !== fusedBase && !declared[1].startsWith(`${fusedBase}/`)) continue;
				const tail = declared[1] === fusedBase ? "" : declared[1].slice(fusedBase.length + 1);
				const expected = ROUTE_METHODS[declared[0]];
				if (method !== expected) {
					writeJson(res, 405, {
						ok: false,
						fused: "dsh-meta-skills",
						error: "method not allowed",
						route: `${ROUTE_PREFIX}${declared[1]}`,
						received: method,
						declared: expected,
						see: `${ROUTE_PREFIX}${CAPABILITIES_PATH}`
					});
					return;
				}
				const answer = await forward(req, `${baseFor(config, family, req)}${CAPABILITIES.find((row) => row.kind === "route" && row.fusedPath === declared[1])?.upstreamPath ?? `${FAMILIES[family].upstreamBase}/${tail}`}${url.search}`, method === "GET" ? Buffer.alloc(0) : await readBody(req), config.timeoutMs ?? 15e3);
				writeForwarded(res, answer.status, answer.body, answer.contentType);
				return;
			}
			writeNotFound(res, pathname);
		} catch (error) {
			if (error instanceof UpstreamUnreachable) {
				writeJson(res, 502, {
					ok: false,
					fused: "dsh-meta-skills",
					error: "upstream member unreachable",
					target: error.target,
					reason: error.message,
					see: `${ROUTE_PREFIX}${HEALTH_PATH}`
				});
				return;
			}
			writeJson(res, 500, {
				ok: false,
				fused: "dsh-meta-skills",
				error: "meta-skills internal error",
				reason: error instanceof Error ? error.message : String(error)
			});
		}
	};
}
/** Reproduce one forwarded response verbatim. */
function writeForwarded(res, status, body, contentType) {
	res.writeHead(status, {
		"content-type": contentType ?? "application/json; charset=utf-8",
		"content-length": body.length,
		"cache-control": "no-store"
	});
	res.end(body);
}
/** The origin one family forwards to, honouring the config's overrides. */
function baseFor(config, family, req) {
	return resolveOrigin(req, config.familyBases?.[family] ?? config.upstreamBase);
}
//#endregion
//#region src/host/index.ts
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
/** Loader row name; the bundle patch's `insert` mounts this same name. */
const name = "dsh-meta-skills";
/** The one service this plugin cannot work without. */
const inject = ["webServer"];
/**
* Mount the fused surface.
*
* @param ctx - the Host plugin context (`webServer`, `effect`, `logger`).
* @param config - optional upstream overrides; a deployment needs none, because the
*   upstream origin is derived from each request's own `Host` header.
*/
function apply(ctx, config) {
	const handler = createRouteHandler(config ?? {});
	ctx.effect(() => ctx.webServer.register({
		kind: "prefix",
		path: ROUTE_PREFIX,
		handler
	}), "dsh-meta-skills: fused family routes");
	ctx.logger.info(`dsh-meta-skills: fused surface mounted at ${ROUTE_PREFIX} (families: ${Object.values(FAMILIES_QUOTED).join(", ")})`);
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
	skills: "/skill-evolution",
	tools: "/tools-skills-evolve/api",
	recall: "/recall-console/api",
	pipeline: "/evolution/api",
	studio: "/skill-studio/api"
};
//#endregion
export { CAPABILITIES, CAPABILITIES_PATH, CENSUS_ADOPTION, CONSIDERED_NOT_FUSED, EXCLUDED_MEMBERS, FAMILIES, FUSED_BEYOND_CENSUS, HEALTH_PATH, ROUTE_METHODS, ROUTE_PATHS, ROUTE_PREFIX, apply, inject, name };
