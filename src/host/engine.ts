/**
 * ============================================================================
 * dsh-meta-skills — THE ENGINE DRIVER
 * ============================================================================
 *
 * WHY THIS FILE EXISTS. The fused surface described the skills/tools family
 * without ever touching the code that selects, recalls, promotes and stores:
 * measured before this file landed, this package imported `node:fs` in 0 of 11
 * source files, so every route it served either forwarded over HTTP or repeated a
 * number. A surface that DESCRIBES an engine is not a surface that DRIVES one,
 * and the difference is not a matter of taste: a described engine keeps answering
 * after the engine is gone.
 *
 * SO THE DRIVER CALLS THE ENGINE'S OWN ENTRY POINTS. The engine modules live in
 * the sibling clone `dsh-skill-evolution`. The function names below are READ from
 * those files, not assumed: `decideSkillSelection` (`skill-select.mjs:376`),
 * `retrieveTrajectories` (`skill-recall.mjs:434`), `decidePromotion`
 * (`skill-promote.mjs:336`), `skillRootTable` (`skill-store.mjs:126`) and
 * `inspectSkillFile` (`skill-store.mjs:573`).
 *
 * EVERY CALL IS TOTAL. A result is `{ok:true, value, servedBy}` when the engine
 * module was found, its export was a function, and the call returned; otherwise
 * it is `{ok:false, reason, kind}` with `kind` in a closed vocabulary. A missing
 * engine is `engine-missing` WITH A REASON — never `0`, never `[]`, never a
 * cheerful `ok`. This is the program's absent-is-not-zero rule applied to the one
 * place where the absence is a FILE: an unreadable module is an absence of a
 * READING, and it must not be rendered as an absence of a value.
 *
 * `ok:true` MEANS THE ENGINE WAS REACHED AND ANSWERED — not that its answer was
 * favourable. `decideSkillSelection` answering `status: 'unavailable'` is a real
 * reading from a real engine call and is carried inside `value`; collapsing that
 * into a driver-level failure would lose the distinction between "the engine was
 * asked and said no" and "the engine was never found".
 *
 * @module dsh-meta-skills/host/engine
 */

import { spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/** The sibling clone whose modules ARE the engine. */
export const ENGINE_MEMBER = 'dsh-skill-evolution'

/** The engine module names this driver is allowed to reach. */
export type EngineFile = 'skill-select.mjs' | 'skill-recall.mjs' | 'skill-promote.mjs' | 'skill-store.mjs'

/** One engine entry point, named by the file that exports it. */
export interface EngineOperation {
  /** The fused path this operation is served at, UNDER the route prefix. */
  readonly fusedPath: string
  /** The engine module that exports the entry point. */
  readonly file: EngineFile
  /** The exported function's name, read from the engine's own source. */
  readonly exportName: string
  /** The verb the fused surface enforces for this operation. */
  readonly verb: 'GET' | 'POST'
  /** One line the ledger publishes verbatim. */
  readonly what: string
}

/**
 * THE OPERATION TABLE. Keys are the ROUTE_PATHS keys for these routes, so the
 * dispatch table, the ledger and this driver are three encodings of one fact and
 * the parity harness can hold them to each other row for row.
 */
export const ENGINE_OPERATIONS = {
  'engine/select': {
    fusedPath: '/api/engine/select',
    file: 'skill-select.mjs',
    exportName: 'decideSkillSelection',
    verb: 'POST',
    what: 'run the skill SELECTOR over a prompt and a skill snapshot, returning the engine own selection record',
  },
  'engine/recall': {
    fusedPath: '/api/engine/recall',
    file: 'skill-recall.mjs',
    exportName: 'retrieveTrajectories',
    verb: 'POST',
    what: 'run trajectory RETRIEVAL over session-store roots and a task, returning the engine own ranked corpus',
  },
  'engine/promote': {
    fusedPath: '/api/engine/promote',
    file: 'skill-promote.mjs',
    exportName: 'decidePromotion',
    verb: 'POST',
    what: 'run the promotion GATE over one candidate, returning the engine own four-state outcome',
  },
  'engine/store-census': {
    fusedPath: '/api/engine/store-census',
    file: 'skill-store.mjs',
    exportName: 'skillRootTable',
    verb: 'GET',
    what: 'read the skill STORE: the engine own root table, then one inspectSkillFile reading per skill found',
  },
} as const satisfies Record<string, EngineOperation>

/** A key of the operation table. */
export type EngineRoute = keyof typeof ENGINE_OPERATIONS

/** The closed refusal vocabulary. A new failure mode must be named here first. */
export type RefusalKind = 'engine-missing' | 'engine-export-missing' | 'bad-input' | 'engine-error'

/** The refusal shape. `ok:false` is the only way to report that nothing was read. */
export interface EngineRefusal {
  readonly ok: false
  readonly reason: string
  readonly kind: RefusalKind
}

/** The success shape: the engine's OWN answer, plus which file served it. */
export interface EngineAnswer<T> {
  readonly ok: true
  readonly servedBy: EngineFile
  readonly value: T
}

/** Every call returns one of these two. There is no third shape. */
export type EngineResult<T> = EngineAnswer<T> | EngineRefusal

/** Knobs a caller (or a harness) may set. Nothing here is required. */
export interface EngineOptions {
  /** Override the engine clone directory. Used by the harness to prove refusals. */
  readonly engineRoot?: string
  /** Override the child-process factory the engine uses for its decision call. */
  readonly spawnImpl?: typeof spawn
  /** The cwd the store census is taken from. Defaults to `process.cwd()`. */
  readonly cwd?: string
}

/** A typed refusal carrying its kind. */
function refuse(kind: RefusalKind, reason: string): EngineRefusal {
  return { ok: false, kind, reason }
}

/** The engine clone directory: the caller's override, else the sibling of this clone. */
export function engineRoot(options: EngineOptions = {}): string {
  const override = options.engineRoot
  if (typeof override === 'string' && override.trim() !== '') return override
  // The built entry sits one level under the clone root, and the engine clone is
  // its sibling, so the URL is relative to THIS module and never a machine path.
  return fileURLToPath(new URL('../../' + ENGINE_MEMBER + '/', import.meta.url))
}

/** Loaded engine modules, keyed by absolute file URL. One import per file per process. */
const LOADED = new Map<string, Promise<Record<string, unknown>>>()

/** Read a plain object body, or `null` when the body is not an object at all. */
function asObject(input: unknown): Record<string, unknown> | null {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) return null
  return input as Record<string, unknown>
}

/** A string field, or `undefined` — never the string "undefined". */
function optionalString(input: unknown): string | undefined {
  return typeof input === 'string' && input.trim() !== '' ? input : undefined
}

/** A finite number field, or `undefined`. */
function optionalNumber(input: unknown): number | undefined {
  return typeof input === 'number' && Number.isFinite(input) ? input : undefined
}

/**
 * Import one engine module and read one export off it.
 *
 * Three distinct refusals, because they are three distinct facts: the MODULE is
 * not on disk (`engine-missing`), the module loaded but does not export the entry
 * point (`engine-export-missing`), or the module threw while being imported
 * (`engine-error`). A driver that flattened them into one reason could not tell a
 * deleted clone from a renamed function.
 */
async function loadExport(
  file: EngineFile,
  exportName: string,
  options: EngineOptions,
): Promise<{ ok: true; fn: (...args: unknown[]) => unknown } | EngineRefusal> {
  const dir = engineRoot(options)
  const path = join(dir, file)
  if (!existsSync(path)) {
    return refuse('engine-missing', 'the engine module ' + file + ' is not at ' + dir + ' — no reading was taken, so this is a refusal and not a zero')
  }
  const url = pathToFileURL(path).href
  let loaded = LOADED.get(url)
  if (loaded === undefined) {
    loaded = import(url) as unknown as Promise<Record<string, unknown>>
    LOADED.set(url, loaded)
  }
  let module: Record<string, unknown>
  try {
    module = await loaded
  } catch (error) {
    LOADED.delete(url)
    return refuse('engine-error', 'the engine module ' + file + ' failed to load: ' + (error instanceof Error ? error.message : String(error)))
  }
  const fn = module[exportName]
  if (typeof fn !== 'function') {
    return refuse('engine-export-missing', file + ' does not export a function named ' + exportName + ', so the entry point this route declares does not exist')
  }
  return { ok: true, fn: fn as unknown as (...args: unknown[]) => unknown }
}

/** Wrap one engine call so a throw becomes a typed refusal rather than a 500 body. */
async function call(fn: (...args: unknown[]) => unknown, args: unknown, servedBy: EngineFile): Promise<EngineResult<unknown>> {
  try {
    const value = await fn(args)
    return { ok: true, servedBy, value }
  } catch (error) {
    return refuse('engine-error', 'the engine entry point threw: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * `POST /api/engine/select` — drive `decideSkillSelection`.
 *
 * The prompt and the snapshot are DEFAULTS not requireds: the route exists so the
 * engine can be asked, and a caller that supplies neither still reaches the
 * engine, which then reports its own `NO_CANDIDATES` reading. That is a real
 * reading, distinguishable from a driver refusal.
 */
export async function engineSelect(input: unknown, options: EngineOptions = {}): Promise<EngineResult<unknown>> {
  const payload = asObject(input)
  if (payload === null) return refuse('bad-input', 'engine/select needs a JSON object body')
  const loaded = await loadExport('skill-select.mjs', 'decideSkillSelection', options)
  if (loaded.ok === false) return loaded
  return call(loaded.fn, {
    snapshot: payload['snapshot'] ?? {},
    prompt: typeof payload['prompt'] === 'string' ? payload['prompt'] : '',
    baseUrl: optionalString(payload['baseUrl']),
    maxCandidates: optionalNumber(payload['maxCandidates']),
    timeoutMs: optionalNumber(payload['timeoutMs']),
    availableFrom: optionalString(payload['availableFrom']),
    spawnImpl: options.spawnImpl ?? spawn,
  }, 'skill-select.mjs')
}

/**
 * `POST /api/engine/recall` — drive `retrieveTrajectories`.
 *
 * `roots` must be an ARRAY OF STRINGS when supplied: a scan over a string is not a
 * scan, and silently coercing one would make the instrument report hits over a
 * population it never enumerated.
 */
export async function engineRecall(input: unknown, options: EngineOptions = {}): Promise<EngineResult<unknown>> {
  const payload = asObject(input)
  if (payload === null) return refuse('bad-input', 'engine/recall needs a JSON object body')
  const roots = payload['roots'] ?? []
  if (!Array.isArray(roots) || roots.some(root => typeof root !== 'string')) {
    return refuse('bad-input', 'engine/recall needs `roots` to be an array of directory strings')
  }
  const loaded = await loadExport('skill-recall.mjs', 'retrieveTrajectories', options)
  if (loaded.ok === false) return loaded
  return call(loaded.fn, {
    roots,
    task: typeof payload['task'] === 'string' ? payload['task'] : '',
    toolSequence: Array.isArray(payload['toolSequence']) ? payload['toolSequence'] : undefined,
    minOverlap: optionalNumber(payload['minOverlap']),
    limit: optionalNumber(payload['limit']),
    excludePaths: Array.isArray(payload['excludePaths']) ? payload['excludePaths'] : undefined,
    maxFiles: optionalNumber(payload['maxFiles']),
    maxBytesPerFile: optionalNumber(payload['maxBytesPerFile']),
  }, 'skill-recall.mjs')
}

/**
 * `POST /api/engine/promote` — drive `decidePromotion`.
 *
 * The candidate is passed through as sent, including an absent name: the engine
 * answers that case itself (`no candidate name was supplied, so the gate was never
 * asked`) and that answer is worth more than a driver-side guess.
 */
export async function enginePromote(input: unknown, options: EngineOptions = {}): Promise<EngineResult<unknown>> {
  const payload = asObject(input)
  if (payload === null) return refuse('bad-input', 'engine/promote needs a JSON object body')
  const candidate = payload['candidate']
  if (candidate !== undefined && (candidate === null || typeof candidate !== 'object' || Array.isArray(candidate))) {
    return refuse('bad-input', 'engine/promote needs `candidate` to be an object when it is supplied')
  }
  const loaded = await loadExport('skill-promote.mjs', 'decidePromotion', options)
  if (loaded.ok === false) return loaded
  return call(loaded.fn, {
    baseUrl: optionalString(payload['baseUrl']),
    candidate: candidate ?? {},
    threshold: optionalNumber(payload['threshold']),
    onUnavailable: optionalString(payload['onUnavailable']),
    timeoutMs: optionalNumber(payload['timeoutMs']),
    spawnImpl: options.spawnImpl ?? spawn,
  }, 'skill-promote.mjs')
}

/**
 * `GET /api/engine/store-census` — read the skill STORE through the engine.
 *
 * Two engine entry points, not one: `skillRootTable(cwd, customDirs)` says WHERE
 * the provider looks (its own rank order), and `inspectSkillFile(path)` parses one
 * `SKILL.md` and reports which frontmatter keys are PRESENT. The census is
 * therefore the engine's own table with the engine's own parse per skill.
 *
 * A root that does not exist is reported with `skills: null` AND its reason. It is
 * not reported as `skills: []`: absence is not zero, and a root nobody created is
 * the exact case that rule is about.
 */
export async function engineStoreCensus(input: unknown, options: EngineOptions = {}): Promise<EngineResult<unknown>> {
  const payload = asObject(input)
  if (payload === null) return refuse('bad-input', 'engine/store-census needs a JSON object body; send {} for defaults')
  const loaded = await loadExport('skill-store.mjs', 'skillRootTable', options)
  if (loaded.ok === false) return loaded
  const inspector = await loadExport('skill-store.mjs', 'inspectSkillFile', options)
  if (inspector.ok === false) return inspector
  const customDirs = payload['customDirs'] ?? []
  if (!Array.isArray(customDirs) || customDirs.some(dir => typeof dir !== 'string')) {
    return refuse('bad-input', 'engine/store-census needs `customDirs` to be an array of directory strings')
  }
  const cwd = optionalString(payload['cwd']) ?? options.cwd ?? process.cwd()

  let table: unknown
  try {
    table = await loaded.fn(cwd, customDirs)
  } catch (error) {
    return refuse('engine-error', 'skillRootTable threw while building the root table: ' + (error instanceof Error ? error.message : String(error)))
  }
  if (!Array.isArray(table)) {
    return refuse('engine-error', 'skillRootTable returned ' + typeof table + ' instead of a table, so no root could be read')
  }

  const roots: Record<string, unknown>[] = []
  let existing = 0
  let skillCount = 0
  let unreadable = 0
  for (const entry of table) {
    const row = asObject(entry)
    if (row === null) {
      return refuse('engine-error', 'skillRootTable returned a non-object row, so the table cannot be read')
    }
    const path = typeof row['path'] === 'string' ? row['path'] : null
    const base = { index: row['index'] ?? null, source: row['source'] ?? null, rank: row['rank'] ?? null, path, note: row['note'] ?? null }
    if (path === null || row['exists'] !== true) {
      roots.push({ ...base, exists: false, skills: null, reason: path === null ? 'this row has no directory at all (a runtime root, or a custom root that is not configured)' : 'this root does not exist on disk, so it holds no skills — reported as null, never as 0' })
      continue
    }
    existing += 1
    let entries: string[] = []
    try {
      entries = readdirSync(path, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name)
    } catch (error) {
      roots.push({ ...base, exists: true, skills: null, reason: 'the root exists but could not be listed: ' + (error instanceof Error ? error.message : String(error)) })
      continue
    }
    const skills: Record<string, unknown>[] = []
    for (const name of entries) {
      const file = join(path, name, 'SKILL.md')
      if (!existsSync(file)) continue
      try {
        const parsed = asObject(await inspector.fn(file)) ?? {}
        skillCount += 1
        if (parsed['ok'] !== true) unreadable += 1
        skills.push({ name, path: file, ok: parsed['ok'] ?? null, problems: parsed['problems'] ?? null, bytes: parsed['bytes'] ?? null, keys: parsed['keys'] ?? null, hasWhenToUse: parsed['hasWhenToUse'] ?? null })
      } catch (error) {
        unreadable += 1
        skills.push({ name, path: file, ok: null, problems: null, bytes: null, keys: null, hasWhenToUse: null, reason: 'inspectSkillFile threw: ' + (error instanceof Error ? error.message : String(error)) })
      }
    }
    roots.push({ ...base, exists: true, skills })
  }

  return {
    ok: true,
    servedBy: 'skill-store.mjs',
    value: {
      cwd,
      customDirs,
      roots,
      totals: { roots: roots.length, existing, skills: skillCount, unreadable },
      source: 'skillRootTable(cwd, customDirs) from skill-store.mjs, then one inspectSkillFile per SKILL.md found',
    },
  }
}

/** One HTTP answer the route layer can write without further interpretation. */
export interface EngineHttpAnswer {
  readonly status: number
  readonly body: Record<string, unknown>
}

/** The status each refusal kind maps to. Named, so a reader can audit the mapping. */
const REFUSAL_STATUS: Readonly<Record<RefusalKind, number>> = Object.freeze({
  'bad-input': 400,
  'engine-missing': 503,
  'engine-export-missing': 503,
  'engine-error': 502,
})

/**
 * Run one engine route and return the answer to write.
 *
 * The 200 body carries the engine's OWN `value` unmodified — this layer adds
 * `servedBy` (which engine file answered) and the route it answered on, and
 * rewrites nothing else.
 */
export async function runEngineRoute(route: EngineRoute, input: unknown, options: EngineOptions = {}): Promise<EngineHttpAnswer> {
  const operation = ENGINE_OPERATIONS[route]
  const result = route === 'engine/select'
    ? await engineSelect(input, options)
    : route === 'engine/recall'
      ? await engineRecall(input, options)
      : route === 'engine/promote'
        ? await enginePromote(input, options)
        : await engineStoreCensus(input, options)
  if (result.ok === false) {
    return { status: REFUSAL_STATUS[result.kind], body: { ok: false, fused: 'dsh-meta-skills', route: operation.fusedPath, kind: result.kind, reason: result.reason } }
  }
  return { status: 200, body: { ok: true, fused: 'dsh-meta-skills', route: operation.fusedPath, servedBy: result.servedBy, value: result.value } }
}
