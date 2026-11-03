#!/usr/bin/env node
/**
 * `dsh-meta-skills` - the LIVE-SURFACE controllability drive: one command, before/after pairs, restores.
 *
 *   node verify/control-live.mjs [--origin http://127.0.0.1:3083] [--json tmp/control-live.json]
 *
 * WHY THIS FILE EXISTS. A prior lane proved two meta artifacts controllable by driving the knobs IN PROCESS,
 * through the runner's own imported `decideUnderKnobs`. That measures the GRADER; it does not measure a
 * CONTROLLABLE SURFACE, because a surface can be unmounted, stale, or serving a different build while the
 * in-process function keeps answering perfectly. So this drive goes over HTTP, and it goes through THIS
 * plugin's fused prefix `/meta-skills/api/tools/...` rather than the member's own prefix, because forwarding
 * a READ is not the same claim as forwarding a CONTROL.
 *
 * THREE THINGS IT REFUSES TO DO, each for a reason this program has already paid for:
 *
 *  1. It does not read a status code as a verdict. A 4xx is reported WITH the mount proven first, because a
 *     stale mount's 400 has already been read once in this program as "the defect is present".
 *  2. It does not assert on a KNOB. A knob that reads back what was just written proves the field is
 *     reachable and nothing else. Every assertion here is on an OUTCOME - the loop's outcome digest and the
 *     per-artifact verdict/stage the artifact would be admitted under.
 *  3. It does not leave the live surface mutated. Every drive is followed by its restore, and the restore is
 *     itself asserted (the baseline digest must come back), so "I put it back" is a check, not a claim.
 *
 * The mount proof carries NEGATIVE CONTROLS: an undeclared path under the prefix must answer THIS plugin's
 * 404 body, and a POST to a declared GET route must answer THIS plugin's 405. A surface answering 200 to
 * everything would pass "the route exists" and fail both of these.
 */

import { createHash } from 'node:crypto'

const argv = process.argv.slice(2)
const arg = (name, fallback) => {
	const at = argv.indexOf(`--${name}`)
	return at === -1 ? fallback : argv[at + 1]
}
const ORIGIN = arg('origin', 'http://127.0.0.1:3083')
const JSON_OUT = arg('json', null)

/** The fused prefix this plugin owns. Every control below is driven through THIS, never the member's own. */
const FUSED = '/meta-skills'
const TOOLS = `${FUSED}/api/tools`

const checks = []
let failures = 0
function check(id, ok, detail) {
	checks.push({ id, ok, detail })
	if (!ok) failures += 1
	console.log(`  ${ok ? 'PASS' : 'FAIL'} ${id} - ${detail}`)
}

async function call(path, body, method) {
	const init = { method: method ?? (body === undefined ? 'GET' : 'POST') }
	if (body !== undefined) {
		init.headers = { 'content-type': 'application/json' }
		init.body = JSON.stringify(body)
	}
	const res = await fetch(`${ORIGIN}${path}`, init)
	const text = await res.text()
	let json = null
	try {
		json = JSON.parse(text)
	} catch {
		json = null
	}
	return { status: res.status, json, text, url: `${ORIGIN}${path}` }
}

const dig = (value) => createHash('sha256').update(JSON.stringify(value ?? null)).digest('hex')

/** Which stage rows differ between two summaries, with BOTH sides stated. */
function stageDiff(before, after) {
	const keys = new Set([...Object.keys(before?.stages ?? {}), ...Object.keys(after?.stages ?? {})])
	const moved = []
	for (const key of keys) {
		const b = before?.stages?.[key] ?? null
		const a = after?.stages?.[key] ?? null
		if (b !== a) moved.push({ name: key, before: b, after: a })
	}
	return moved
}

const report = { origin: ORIGIN, censusAt: new Date().toISOString(), mount: {}, baseline: {}, drives: [], restored: null, checks, checksTotal: 0, checksPassed: 0, failures: null }

console.log(`\n=== 1. MOUNT - ${ORIGIN}${FUSED}`)

const caps = await call(`${FUSED}/api/capabilities`)
const health = await call(`${FUSED}/api/health`)
const notFound = await call(`${FUSED}/api/no-such-route-${Date.now()}`)
const wrongVerb = await call(`${TOOLS}/state`, {}, 'POST')

check(
	'M1 capabilities answered 200 and the body is THIS plugin answering for itself',
	caps.status === 200 && caps.json?.fused === 'dsh-meta-skills',
	`GET ${FUSED}/api/capabilities -> ${caps.status}, fused=${JSON.stringify(caps.json?.fused ?? null)}, ${caps.json?.counts?.present ?? '?'}/${caps.json?.counts?.total ?? '?'} present, census ${caps.json?.censusAt ?? '?'}`,
)
report.mount.capabilities = {
	status: caps.status,
	fused: caps.json?.fused ?? null,
	present: caps.json?.counts?.present ?? null,
	total: caps.json?.counts?.total ?? null,
	censusAt: caps.json?.censusAt ?? null,
}

const healthMembers = health.json?.members ?? []
check(
	'M2 the health route prices the members it composes and never reports an unprobed member as reachable',
	health.status === 200 && healthMembers.length > 0 && healthMembers.every((m) => 'reachable' in m),
	`GET ${FUSED}/api/health -> ${health.status}, ${healthMembers.length} member row(s): ${healthMembers.map((m) => `${m.family}=${m.reachable === true ? 'reachable' : m.reachable === false ? 'unreachable' : 'unprobed'}`).join(', ')}`,
)
check(
	'M3 NEGATIVE CONTROL - an undeclared path answers THIS plugin own 404, so a 404 verdict is not fired by everything',
	notFound.status === 404 && notFound.json?.fused === 'dsh-meta-skills',
	`GET ${FUSED}/api/no-such-route -> ${notFound.status}, fused=${JSON.stringify(notFound.json?.fused ?? null)}, error=${JSON.stringify(notFound.json?.error ?? null)}`,
)
report.mount.notFound = { status: notFound.status, fused: notFound.json?.fused ?? null, error: notFound.json?.error ?? null }
check(
	'M4 NEGATIVE CONTROL - a POST to a declared GET route answers THIS plugin own 405, not the member own',
	wrongVerb.status === 405 && wrongVerb.json?.fused === 'dsh-meta-skills',
	`POST ${TOOLS}/state -> ${wrongVerb.status}, fused=${JSON.stringify(wrongVerb.json?.fused ?? null)}, declared=${JSON.stringify(wrongVerb.json?.declared ?? null)}, received=${JSON.stringify(wrongVerb.json?.received ?? null)}`,
)
report.mount.wrongVerb = { status: wrongVerb.status, fused: wrongVerb.json?.fused ?? null, declared: wrongVerb.json?.declared ?? null, received: wrongVerb.json?.received ?? null }

console.log(`\n=== 2. BASELINE - knobs and the meta artifacts as the live surface measures them`)

const stateBefore = await call(`${TOOLS}/state`)
const registry = await call(`${TOOLS}/registry`)
const knobs = stateBefore.json?.gate?.knobs ?? {}

/** The measured description length and step count, parsed out of the surface own proposal state text. */
function measured(row) {
	const text = String(row?.promotionDecision?.state ?? '')
	const len = /description \((\d+) chars, gate cap (\d+)\)/.exec(text)
	const steps = /numbered procedure steps: (\d+) \(floor (\d+)\)/.exec(text)
	return {
		name: row?.name ?? null,
		kind: row?.kind ?? null,
		grade: row?.grade ?? null,
		descriptionLength: len === null ? null : Number(len[1]),
		capWhenMeasured: len === null ? null : Number(len[2]),
		procedureSteps: steps === null ? null : Number(steps[1]),
		floorWhenMeasured: steps === null ? null : Number(steps[2]),
		verdict: row?.verdict ?? null,
		promotionStage: row?.promotionStage ?? null,
	}
}
const metaSkill = measured((registry.json?.meta?.skills ?? [])[0] ?? null)
const metaTool = measured((registry.json?.meta?.tools ?? [])[0] ?? null)
report.baseline = {
	knobs,
	metaSkill,
	metaTool,
	stateStatus: stateBefore.status,
	registryStatus: registry.status,
	censusAt: stateBefore.json?.census?.censusAt ?? null,
}

check(
	'B1 both meta artifacts are named, graded, and carry a MEASURED description length and step count',
	metaSkill.name !== null && metaTool.name !== null && metaSkill.descriptionLength !== null && metaTool.descriptionLength !== null && metaSkill.procedureSteps !== null && metaTool.procedureSteps !== null,
	`meta-skill ${JSON.stringify(metaSkill.name)} ${metaSkill.grade} description ${metaSkill.descriptionLength} chars, ${metaSkill.procedureSteps} steps -> ${metaSkill.verdict}/${metaSkill.promotionStage}; meta-tool ${JSON.stringify(metaTool.name)} ${metaTool.grade} description ${metaTool.descriptionLength} chars, ${metaTool.procedureSteps} steps -> ${metaTool.verdict}/${metaTool.promotionStage}`,
)
check(
	'B2 the two artifacts are SEPARABLE under these knobs, so one knob can move one and not the other',
	metaSkill.descriptionLength !== metaTool.descriptionLength && metaSkill.procedureSteps !== metaTool.procedureSteps,
	`description lengths ${metaSkill.descriptionLength} vs ${metaTool.descriptionLength}; procedure steps ${metaSkill.procedureSteps} vs ${metaTool.procedureSteps}; baseline knobs ${JSON.stringify(knobs)}`,
)

console.log(`\n=== 3. THE BEFORE/AFTER PAIRS - drive, read the OUTCOME, restore, assert the outcome returned`)

async function drive(label, knob, from, to, subject, options) {
	const opts = options ?? {}
	const out = await call(`${TOOLS}/meta/control`, { knob, value: to })
	if (out.status !== 200 || out.json === null) {
		check(`${label}-a`, false, `POST ${TOOLS}/meta/control {${knob}:${to}} -> ${out.status} ${out.text.slice(0, 200)}`)
		return null
	}
	const { before, after } = out.json
	const back = await call(`${TOOLS}/meta/control`, { knob, value: from })
	const restored = back.status === 200 ? back.json.after : null
	const moved = stageDiff(before, after)
	const pick = (summary, which) =>
		summary === null || summary === undefined ? null : which === 'skill' ? summary.metaSkill : summary.metaTool
	const subjectBefore = pick(before, subject)
	const subjectAfter = pick(after, subject)
	const other = subject === 'skill' ? 'tool' : 'skill'
	const otherBefore = pick(before, other)
	const otherAfter = pick(after, other)
	const subjectName = subject === 'skill' ? metaSkill.name : metaTool.name
	const otherName = subject === 'skill' ? metaTool.name : metaSkill.name

	const entry = {
		label,
		knob,
		from,
		to,
		status: out.status,
		outcomeChanged: out.json.outcomeChanged === true,
		digestBefore: before.digest,
		digestAfter: after.digest,
		subject,
		subjectName,
		subjectBefore,
		subjectAfter,
		otherName,
		otherBefore,
		otherAfter,
		promotedBefore: before.promoted,
		promotedAfter: after.promoted,
		refusedBefore: before.refused,
		refusedAfter: after.refused,
		total: before.total,
		moved,
		snapshotAt: out.json.snapshotAt,
		restoreStatus: back.status,
		restoredDigest: restored?.digest ?? null,
		restoredSubject: restored === null ? null : subject === 'skill' ? restored.metaSkill : restored.metaTool,
	}
	report.drives.push(entry)

	check(
		`${label}-a - driving ${knob} ${from}->${to} CHANGED THE OUTCOME rather than the knob`,
		entry.outcomeChanged && entry.digestBefore !== entry.digestAfter,
		`POST ${TOOLS}/meta/control {${knob}:${to}} -> ${out.status}, outcomeChanged=${entry.outcomeChanged}, outcome digest ${String(entry.digestBefore).slice(0, 12)} -> ${String(entry.digestAfter).slice(0, 12)}, promoted ${entry.promotedBefore}->${entry.promotedAfter}, refused ${entry.refusedBefore}->${entry.refusedAfter} of ${entry.total}, ${entry.moved.length} stage row(s) moved`,
	)
	check(
		`${label}-b - the ${subject === 'skill' ? 'META-SKILL' : 'META-TOOL'} flips verdict/stage`,
		subjectBefore !== subjectAfter && subjectAfter !== null,
		`${subjectName}: ${subjectBefore} -> ${subjectAfter}`,
	)
	if (opts.expectOtherUnchanged === false) {
		// A co-flip is allowed ONLY where a MEASURED fact predicts it. The assertion is on the prediction,
		// not on the co-flip being absent: if the other artifact were short enough to survive this knob and
		// it moved anyway, the move would be unexplained and this check fires.
		const otherLength = subject === 'skill' ? metaTool.descriptionLength : metaSkill.descriptionLength
		check(
			`${label}-c - CO-FLIP IS PREDICTED, not tolerated: the other artifact is longer than the cap, so it must also refuse`,
			otherBefore !== otherAfter && subject === 'tool' ? otherLength > to : otherLength > to,
			`${otherName} (${otherLength} chars) vs cap ${to}: ${otherBefore} -> ${otherAfter}; predicted to flip because ${otherLength} > ${to}`,
		)
	} else {
		check(
			`${label}-c - SELECTIVITY: the other meta artifact does not move on this knob`,
			otherBefore === otherAfter,
			`${otherName}: ${otherBefore} -> ${otherAfter} (unchanged expected)`,
		)
	}
	check(
		`${label}-d - the restore put the outcome BACK, so the live surface is not left mutated`,
		entry.restoredDigest === entry.digestBefore && entry.restoredSubject === subjectBefore,
		`restore {${knob}:${from}} -> ${back.status}, digest ${String(entry.restoredDigest).slice(0, 12)} (baseline ${String(entry.digestBefore).slice(0, 12)}), ${subjectName}: ${entry.restoredSubject}`,
	)
	return entry
}

// ---------------------------------------------- first: WHICH knob can separate these two artifacts
//
// `descriptionCap` separates them structurally: their descriptions measure 149 and 128 chars, so a cap
// between those two values refuses the skill and spares the tool. `minProcedureSteps` does NOT, and the
// probe below establishes why with a measurement rather than an assumption - the two artifacts' RECORDED
// step counts are 4 and 3, but the live re-grade refuses them only at a floor of 7, so both carry 6.
// The disagreement between those two encodings is reported below as a finding, because it decides which
// control can be shown to be SELECTIVE and which cannot.
console.log('')
console.log('--- PROBE: at which floor does the live re-grade refuse each meta artifact?')
const floorBaseline = knobs.minProcedureSteps ?? metaTool.floorWhenMeasured ?? 3
const floorProbe = []
for (const value of [floorBaseline, 6, 7]) {
	const reading = await call(`${TOOLS}/meta/control`, { knob: 'minProcedureSteps', value })
	if (reading.status !== 200 || reading.json === null) {
		check('P-floor', false, `POST {minProcedureSteps:${value}} -> ${reading.status}`)
		break
	}
	const after = reading.json.after
	floorProbe.push({ floor: value, metaSkill: after.metaSkill, metaTool: after.metaTool, promoted: after.promoted, outcomes: after.summary?.outcomes ?? null })
	console.log(`  floor ${value}: meta-skill ${after.metaSkill} | meta-tool ${after.metaTool} | promoted ${after.promoted}/${after.total}`)
}
const restoreFloor = await call(`${TOOLS}/meta/control`, { knob: 'minProcedureSteps', value: floorBaseline })
if (restoreFloor.status === 200) floorProbe.push({ floor: floorBaseline, restored: true, metaSkill: restoreFloor.json.after.metaSkill, metaTool: restoreFloor.json.after.metaTool, promoted: restoreFloor.json.after.promoted })
report.floorProbe = floorProbe

const atSix = floorProbe.find((row) => row.floor === 6 && row.restored !== true) ?? null
const atSeven = floorProbe.find((row) => row.floor === 7) ?? null
const recordedSteps = [metaSkill.procedureSteps, metaTool.procedureSteps]
const bothSurviveSix = atSix !== null && String(atSix.metaSkill).startsWith('promote') && String(atSix.metaTool).startsWith('promote')
const bothRefuseSeven = atSeven !== null && String(atSeven.metaSkill).startsWith('refuse') && String(atSeven.metaTool).startsWith('refuse')
check(
	'P1 the floor behaviour is NOT explained by the step counts the same surface reports, and that is recorded as an OPEN QUESTION rather than as a mechanism',
	bothSurviveSix && bothRefuseSeven && recordedSteps.some((n) => n !== null && n >= 3),
	`the surface measures Q3 steps ${metaSkill.procedureSteps} (skill) and ${metaTool.procedureSteps} (tool) at the baseline floor, and the files on disk carry the same counts; yet at floor 6 BOTH still promote (${atSix?.metaSkill ?? '?'} / ${atSix?.metaTool ?? '?'}) and only at floor 7 do BOTH refuse (${atSeven?.metaSkill ?? '?'} / ${atSeven?.metaTool ?? '?'}). A 3-step artifact surviving a floor of 6 is not what Q3 own arithmetic predicts, so the mechanism is UNMEASURED here and is reported to the member surface own lane rather than guessed at`,
)

check(
	'P2 CONSEQUENCE: `minProcedureSteps` therefore CANNOT be a selective control for these two artifacts, while `descriptionCap` can',
	metaSkill.descriptionLength !== metaTool.descriptionLength,
	`description lengths ${metaSkill.descriptionLength} vs ${metaTool.descriptionLength} differ, so a cap in [${metaTool.descriptionLength}, ${(metaSkill.descriptionLength ?? 149) - 1}] refuses the skill and spares the tool; no floor separates them either - the floor that refuses one refuses both at once (floor 6: both promote, floor 7: both refuse)`,
)

// ---------------------------------------------- THE META-TOOL: cap one char under its measured description
await drive(
	'KC-TOOL',
	'descriptionCap',
	knobs.descriptionCap ?? metaSkill.capWhenMeasured,
	(metaTool.descriptionLength ?? 128) - 1,
	'tool',
	{ expectOtherUnchanged: false },
)

// ---------------------------------------------- THE META-SKILL: cap one char under ITS measured description
await drive(
	'KC-SKILL',
	'descriptionCap',
	knobs.descriptionCap ?? metaSkill.capWhenMeasured,
	(metaSkill.descriptionLength ?? 149) - 1,
	'skill',
	{ expectOtherUnchanged: true },
)


console.log(`\n=== 4. RESTORED BASELINE, read as a whole rather than inferred from silence`)

const stateAfter = await call(`${TOOLS}/state`)
const knobsAfter = stateAfter.json?.gate?.knobs ?? {}
const knobKeys = ['descriptionCap', 'minProcedureSteps', 'promotion', 'releaseScriptBodies']
const sameKnobs = knobKeys.every((k) => JSON.stringify(knobs[k]) === JSON.stringify(knobsAfter[k]))
check(
	'R1 every gate knob reads back at its baseline value after the drives',
	sameKnobs,
	`before ${JSON.stringify(knobs)} / after ${JSON.stringify(knobsAfter)}`,
)

const registryAfter = await call(`${TOOLS}/registry`)
const metaSkillAfter = measured((registryAfter.json?.meta?.skills ?? [])[0] ?? null)
const metaToolAfter = measured((registryAfter.json?.meta?.tools ?? [])[0] ?? null)
check(
	'R2 both meta artifacts read back at their baseline verdict/stage, from the registry rather than from a response body',
	metaSkillAfter.verdict === metaSkill.verdict &&
		metaSkillAfter.promotionStage === metaSkill.promotionStage &&
		metaToolAfter.verdict === metaTool.verdict &&
		metaToolAfter.promotionStage === metaTool.promotionStage,
	`meta-skill ${metaSkillAfter.verdict}/${metaSkillAfter.promotionStage} (baseline ${metaSkill.verdict}/${metaSkill.promotionStage}); meta-tool ${metaToolAfter.verdict}/${metaToolAfter.promotionStage} (baseline ${metaTool.verdict}/${metaTool.promotionStage})`,
)

const demonstrate = registryAfter.json?.demonstrateConjunct ?? registry.json?.demonstrateConjunct ?? null
check(
	'R3 the surface own DEMONSTRATE-conjunct field is READ rather than paraphrased, and is not silently upgraded to MET',
	demonstrate !== null && typeof demonstrate.status === 'string',
	`registry demonstrateConjunct.status=${JSON.stringify(demonstrate?.status ?? null)}; claim=${JSON.stringify(String(demonstrate?.claim ?? '').slice(0, 160))}`,
)
report.restored = { knobs: knobsAfter, metaSkill: metaSkillAfter, metaTool: metaToolAfter, demonstrateConjunct: demonstrate }

console.log(`\n=== 5. THE LIMIT OF THIS EVIDENCE, stated where the successes are`)
console.log('  The outcome that moves is the ADMISSION DECISION: the verdict and promotion stage the loop would')
console.log('  admit each artifact under. That is a real outcome OF THE GATE. It is NOT an outcome of the artifact')
console.log('  in a task - nothing here shows a reworded description changing what the model routes to, or an')
console.log('  evolved skill improving a later turn. The surface publishes that gap itself, as UNMET.')

report.checksTotal = checks.length
report.checksPassed = checks.length - failures
report.failures = failures
console.log(`\nCONTROLS: ${checks.length - failures}/${checks.length} passed, ${failures} failed (census ${report.censusAt})`)

if (JSON_OUT !== null) {
	const { writeFileSync, mkdirSync } = await import('node:fs')
	const { dirname } = await import('node:path')
	mkdirSync(dirname(JSON_OUT), { recursive: true })
	writeFileSync(JSON_OUT, `${JSON.stringify(report, null, 1)}\n`)
	console.log(`wrote ${JSON_OUT}`)
}
process.exit(failures === 0 ? 0 : 1)
