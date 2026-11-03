/**
 * ============================================================================
 * dsh-meta-skills — the ENGINE harness
 * ============================================================================
 *
 * WHAT THIS PROVES, in the order it proves it:
 *
 *  1. THE DRIVER REACHES A REAL ENGINE ENTRY POINT AND ITS ANSWER CHANGES THE
 *     RESULT. The decision backend is stubbed at the ENGINE's own seam
 *     (`spawnImpl`, the factory `askDecisionModel` uses), so the selector really
 *     runs, really scores the candidates and really returns the choice it was
 *     given. Two runs with two different stubbed choices must produce two
 *     DIFFERENT selections — a driver that answered from a constant would pass a
 *     'returns ok' test and fail this one.
 *  2. A SOURCE MUTATION OF THE ENGINE FILE CHANGES THE RESULT. A temporary copy of
 *     `skill-select.mjs` is written with an early `return`, and the driver is
 *     pointed at that root. The result must change, which is what makes 'the
 *     driver reads the engine' a measurement rather than a description.
 *  3. A MISSING ENGINE IS A TYPED REFUSAL, never `0` and never `[]`.
 *  4. TWO MUTATIONS OF THE DRIVER MUST GO RED:
 *       - `describe-not-drive` reproduces the defect this whole task fixes: the
 *         surface answers from a constant instead of asking the engine.
 *       - `absent-as-zero` reproduces the program's oldest measurement trap: it
 *         answers `ok` when the engine file is not there at all.
 *     Each mutant is run through the SAME check that is GREEN for the real
 *     driver. A mutant that stayed green would mean the check cannot fail.
 *
 * Exit codes: `0` every check green, `1` at least one check failed.
 *
 * @module dsh-meta-skills/verify/engine
 */

import { EventEmitter } from 'node:events'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { PassThrough } from 'node:stream'
import { fileURLToPath } from 'node:url'

import {
  ENGINE_OPERATIONS,
  enginePromote,
  engineRecall,
  engineSelect,
  engineStoreCensus,
} from '../lib/index.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const PLUGIN_DIR = join(HERE, '..')
const CLONES = join(PLUGIN_DIR, '..')
const ENGINE_DIR = join(CLONES, 'dsh-skill-evolution')
const CENSUS_AT = new Date().toISOString()

const results = []

/** Record one check. A throw is a FAILURE with its message, never a crash. */
async function check(name, fn) {
  const started = Date.now()
  try {
    const detail = await fn()
    results.push({ name, ok: true, detail: String(detail), ms: Date.now() - started })
  } catch (error) {
    results.push({ name, ok: false, detail: error instanceof Error ? error.message : String(error), ms: Date.now() - started })
  }
}

/** Throw unless `condition` holds. */
function need(condition, message) {
  if (!condition) throw new Error(message)
}

/**
 * A stand-in for `curl`, at the ENGINE's own seam.
 *
 * `askDecisionModel` spawns `curl` and parses its stdout as JSON, so a child
 * process is what the engine expects and a child process is what it gets. The
 * payload is the backend's answer document, in the shape the engine validates:
 * `{ answers: { skill: { choice } } }`.
 */
function fakeSpawn(payload) {
  return function spawnImpl() {
    const child = new EventEmitter()
    // STDIN IS NOT DECORATION. `askDecisionModel` calls curl with `--data-binary @-` and
    // WRITES the request body to `child.stdin`, so a stub with no stdin throws
    // "Cannot read properties of undefined (reading 'write')" inside the engine's own try
    // and the answer comes back as decision-backend-fetch-failed — a refusal that names
    // the stub, not the engine, which is why this line is here rather than implied.
    child.stdin = new PassThrough()
    child.stdout = new PassThrough()
    child.stderr = new PassThrough()
    child.kill = () => {}
    // THE CLOSE MUST FOLLOW THE DATA. `askDecisionModel` accumulates stdout from
    // 'data' events and parses it in its 'close' handler, so emitting 'close' in the
    // same tick as `end()` delivers an EMPTY body and the engine correctly refuses it
    // as a bad response. The two timers are the sequencing the real `curl` process
    // provides for free: bytes first, exit status after.
    setTimeout(() => {
      child.stdout.write(JSON.stringify(payload))
      child.stdout.end()
      child.stderr.end()
      setTimeout(() => child.emit('close', 0), 20)
    }, 1)
    return child
  }
}

/** Three candidates, complete catalog, no invocation policy to filter them out. */
const SNAPSHOT = {
  complete: true,
  skills: [
    { name: 'alpha-skill', description: 'first candidate' },
    { name: 'beta-skill', description: 'second candidate' },
    { name: 'gamma-skill', description: 'third candidate' },
  ],
}

/** The selection one stubbed backend answer produces, through the real driver. */
async function selectWith(choice, options = {}) {
  return await engineSelect(
    { prompt: 'pick a skill for this task', snapshot: SNAPSHOT },
    // The answer carries a CONFIDENCE because the engine gates the status on it: a choice
    // with no confidence reading is not promoted to status 'selected'. Without it the
    // stub would return a valid name and the engine would still answer 'no-selection',
    // which is the engine being right and the stub being incomplete.
    { ...options, spawnImpl: fakeSpawn({ answers: { skill: { choice, confidence: 0.9 } } }) },
  )
}

// ---------------------------------------------------------------- 1. the engine is reached, and answers

await check('engine: the selector is driven and returns its own selection record', async () => {
  const answer = await selectWith('alpha-skill')
  need(answer.ok === true, `the driver refused: ${answer.reason ?? ''}`)
  need(answer.servedBy === 'skill-select.mjs', `servedBy is ${answer.servedBy}, not skill-select.mjs`)
  need(answer.value.status === 'selected', `the engine status is ${answer.value.status}, not 'selected'`)
  // `selected` is the engine's ARRAY of selections (one for the single-skill route today),
  // not a bare name: reading `.name` off it yields undefined and would report a working
  // driver as having selected nothing.
  need(answer.value.selected?.[0]?.name === 'alpha-skill', `the engine selected ${String(answer.value.selected?.[0]?.name)}`)
  return `selected ${answer.value.selected[0].name} of ${answer.value.availableCount} candidates, served by ${answer.servedBy}`
})

await check('engine: a DIFFERENT backend answer changes the RESULT (selection is not canned)', async () => {
  const first = await selectWith('alpha-skill')
  const second = await selectWith('beta-skill')
  need(first.ok === true && second.ok === true, 'one of the two runs refused')
  const a = first.value.selected?.[0]?.name
  const b = second.value.selected?.[0]?.name
  need(a === 'alpha-skill', `the first run selected ${String(a)}`)
  need(b === 'beta-skill', `the second run selected ${String(b)}`)
  need(a !== b, `both runs selected ${String(a)} — a constant answer is not a selection`)
  return `${a} then ${b}: the answer moved the result`
})

// ---------------------------------------------------------------- 2. a source mutation of the ENGINE moves it

const scratch = mkdtempSync(join(tmpdir(), 'dsh-meta-skills-engine-'))

await check('engine: a MUTATED engine file changes the result (the driver reads the file)', async () => {
  const root = join(scratch, 'mutated')
  mkdirSync(root, { recursive: true })
  const source = readFileSync(join(ENGINE_DIR, 'skill-select.mjs'), 'utf8')
  const marker = 'export async function decideSkillSelection(options) {'
  need(source.includes(marker), 'the engine no longer declares decideSkillSelection at the line this harness edits')
  const mutated = source.replace(marker, `${marker}\n  return { status: 'unavailable', reason: 'MUTATED-ENGINE' }`)
  need(mutated !== source, 'the mutation did not change the file')
  writeFileSync(join(root, 'skill-select.mjs'), mutated)
  const answer = await selectWith('alpha-skill', { engineRoot: root })
  need(answer.ok === true, `the driver refused over the mutated copy: ${answer.reason ?? ''}`)
  need(answer.value.reason === 'MUTATED-ENGINE', `the mutated engine's own reason did not reach the result: ${JSON.stringify(answer.value.reason ?? null)}`)
  return 'the mutated copy returned MUTATED-ENGINE, so the result follows the FILE and not a description'
})

// ---------------------------------------------------------------- 3. a missing engine is a typed refusal

await check('engine: a missing engine module is a typed refusal, never a zero', async () => {
  const empty = join(scratch, 'empty')
  mkdirSync(empty, { recursive: true })
  const answer = await engineSelect({ prompt: 'x', snapshot: SNAPSHOT }, { engineRoot: empty })
  need(answer.ok === false, 'the driver answered ok with no engine on disk — absent treated as zero')
  need(answer.kind === 'engine-missing', `the refusal kind is ${String(answer.kind)}`)
  need(typeof answer.reason === 'string' && answer.reason.length > 0, 'the refusal carries no reason')
  return `refused as ${answer.kind}: ${answer.reason.slice(0, 60)}…`
})

await check('engine: a module that does not export the entry point is its own refusal', async () => {
  const root = join(scratch, 'wrong-export')
  mkdirSync(root, { recursive: true })
  writeFileSync(join(root, 'skill-select.mjs'), 'export const nothing = 1\n')
  const answer = await engineSelect({ prompt: 'x', snapshot: SNAPSHOT }, { engineRoot: root })
  need(answer.ok === false, 'the driver answered ok for a module that exports no selector')
  need(answer.kind === 'engine-export-missing', `the refusal kind is ${String(answer.kind)}`)
  return `refused as ${answer.kind}`
})

// ---------------------------------------------------------------- 4. the other two entry points, driven

await check('engine: recall is driven and returns the retrieval record', async () => {
  const answer = await engineRecall({ roots: [], task: 'walk a session log' })
  need(answer.ok === true, `the driver refused: ${answer.reason ?? ''}`)
  need(answer.servedBy === 'skill-recall.mjs', `servedBy is ${answer.servedBy}`)
  need(typeof answer.value.hitCount === 'number', 'the result carries no hitCount')
  need(typeof answer.value.instrumentOk === 'boolean', 'the result carries no instrumentOk — a scan that never ran must say so')
  return `hitCount ${answer.value.hitCount} of ${answer.value.candidateCount} candidates, instrumentOk ${answer.value.instrumentOk}`
})

await check('engine: the promotion gate is driven and returns its own outcome', async () => {
  const answer = await enginePromote(
    { baseUrl: 'http://127.0.0.1:1', candidate: { name: 'demo-skill', description: 'd', content: 'c' } },
    { spawnImpl: fakeSpawn({ answers: { skill: { choice: 'keep', answer_confidence: 0.9 } } }) },
  )
  need(answer.ok === true, `the driver refused: ${answer.reason ?? ''}`)
  need(answer.servedBy === 'skill-promote.mjs', `servedBy is ${answer.servedBy}`)
  need(answer.value.candidateName === 'demo-skill', `candidateName is ${String(answer.value.candidateName)}`)
  need(typeof answer.value.outcome === 'string', 'the gate record carries no outcome')
  need(typeof answer.value.permitted === 'boolean', 'the gate record carries no permitted flag')
  return `outcome ${answer.value.outcome}, permitted ${answer.value.permitted}`
})

await check('engine: the store census is read through the engine root table', async () => {
  const answer = await engineStoreCensus({ cwd: PLUGIN_DIR })
  need(answer.ok === true, `the driver refused: ${answer.reason ?? ''}`)
  need(answer.servedBy === 'skill-store.mjs', `servedBy is ${answer.servedBy}`)
  const totals = answer.value.totals
  need(totals.roots > 0, `the engine root table returned ${totals.roots} roots — 0 is instrument failure here`)
  need(answer.value.roots.length === totals.roots, `${answer.value.roots.length} rows for ${totals.roots} roots`)
  const withNull = answer.value.roots.filter(row => row.path === null).length
  return `${totals.roots} roots, ${totals.existing} existing, ${totals.skills} skills, ${totals.unreadable} unreadable, ${withNull} row(s) with no directory`
})

// ---------------------------------------------------------------- 5. two mutations that must go RED

/**
 * MUTANT 1 — `describe-not-drive`.
 *
 * The defect the whole task fixes: the surface answers from a constant instead
 * of asking the engine. It is `ok`, it carries a `servedBy`, and it is a lie.
 */
const describeNotDrive = {
  name: 'describe-not-drive',
  defect: 'answered from a constant instead of calling the engine',
  select: async () => ({ ok: true, servedBy: 'skill-select.mjs', value: { status: 'selected', selected: { name: 'alpha-skill' }, availableCount: 3 } }),
}

/**
 * MUTANT 2 — `absent-as-zero`.
 *
 * The program's oldest measurement trap, in the one place where the absence is a
 * FILE: a driver that reports success when there is nothing there to read.
 */
const absentAsZero = {
  name: 'absent-as-zero',
  defect: 'reported ok when the engine module did not exist',
  select: async () => ({ ok: true, servedBy: 'skill-select.mjs', value: { status: 'unavailable', reason: null } }),
}

/** The check the two mutants are run through, as a boolean rather than a record. */
async function selectionMovesWithTheAnswer(select) {
  const first = await select('alpha-skill')
  const second = await select('beta-skill')
  if (first.ok !== true || second.ok !== true) return false
  // THE ENGINE'S `selected` IS AN ARRAY. Reading `.name` off it yields undefined, which
  // would make the REAL driver look like the constant mutant — the check would then pass
  // its "does not move" half for the wrong reason and the RED half would be unearned.
  return first.value.selected?.[0]?.name === 'alpha-skill' && second.value.selected?.[0]?.name === 'beta-skill'
}

async function missingEngineIsRefused(select) {
  const empty = join(scratch, 'empty-for-mutant')
  mkdirSync(empty, { recursive: true })
  const answer = await select({ prompt: 'x', snapshot: SNAPSHOT }, { engineRoot: empty })
  return answer.ok === false && answer.kind === 'engine-missing'
}

/** The real driver, adapted to the same shape the mutants expose. */
const realDriver = {
  name: 'driver under test',
  select: async choice => await selectWith(choice),
}

await check('mutation 1 of 2: describe-not-drive must go RED, and the real driver is GREEN', async () => {
  const real = await selectionMovesWithTheAnswer(realDriver.select)
  need(real === true, 'the real driver did NOT move with the answer — the check below cannot fail')
  const mutant = await selectionMovesWithTheAnswer(describeNotDrive.select)
  need(mutant === false, `${describeNotDrive.name} stayed GREEN — the check cannot fail, so it is not a check`)
  return `real GREEN, ${describeNotDrive.name} RED (${describeNotDrive.defect})`
})

await check('mutation 2 of 2: absent-as-zero must go RED, and the real driver is GREEN', async () => {
  const real = await missingEngineIsRefused(async (input, options) => await engineSelect(input, options))
  need(real === true, 'the real driver did not refuse a missing engine')
  const mutant = await missingEngineIsRefused(absentAsZero.select)
  need(mutant === false, `${absentAsZero.name} stayed GREEN — absent was accepted as a value`)
  return `real GREEN, ${absentAsZero.name} RED (${absentAsZero.defect})`
})

// ---------------------------------------------------------------- the verdict

rmSync(scratch, { recursive: true, force: true })

const failed = results.filter(result => result.ok === false)
const passed = results.filter(result => result.ok === true)
const engineRoutes = Object.keys(ENGINE_OPERATIONS)

console.log('')
console.log(`dsh-meta-skills engine harness — census ${CENSUS_AT}`)
console.log(`engine routes declared by the driver: ${engineRoutes.length}/${engineRoutes.length} (${engineRoutes.join(', ')})`)
console.log('')
for (const result of results) {
  console.log(`${result.ok ? 'ok  ' : 'FAIL'} — ${result.name} (${result.ms} ms)`)
  console.log(`       ${result.detail}`)
}
console.log('')
if (failed.length === 0) {
  console.log(`VERDICT: PASS — ${passed.length}/${results.length} checks green, 2/2 mutations RED, census ${CENSUS_AT}`)
  process.exit(0)
}
console.log(`VERDICT: FAIL — ${failed.length} of ${results.length} checks failed: ${failed.map(result => result.name).join('; ')}`)
process.exit(1)
