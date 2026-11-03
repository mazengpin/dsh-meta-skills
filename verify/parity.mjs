#!/usr/bin/env node
/**
 * ============================================================================
 * dsh-meta-skills — CAPABILITY PARITY HARNESS
 * ============================================================================
 *
 * WHAT THIS MEASURES. `D-0352` rule 2: capability parity is the acceptance test,
 * not route count. So this harness drives EVERY declared capability of every
 * absorbed member THROUGH the fused surface (`/meta-skills`), and records
 * PASS / FAIL / UNMEASURED-with-reason per capability over an explicit
 * denominator. A member whose capability cannot be reproduced is reported as
 * UNMEASURED WITH ITS REASON — never as a zero, never as a silent absence.
 *
 * WHY THE LEDGER IS READ FROM `lib/`. It is imported from the BUILT artifact, so
 * the harness prices what a profile actually loads. A harness that read the
 * TypeScript could pass over a build that exported nothing.
 *
 * WHY THE POPULATION IS RECOUNTED FROM THE MEMBERS' OWN SOURCE. The ledger is one
 * encoding of "what the family can do"; the members' dispatch tables are another.
 * If a member adds or renames a route and this ledger is not updated, the two
 * encodings disagree and this harness fails — which is the only mechanism that
 * keeps a described capability from being mistaken for a measured one.
 *
 * HOW TO MAKE IT GO RED (falsification; each was run and reverted):
 *   1. drop a route from the dispatcher (`src/host/routes.ts`) → the driven
 *      capability count falls below its denominator → RED;
 *   2. drop a row from the ledger (`src/shared/protocol.ts`) → the source recount
 *      disagrees with the ledger → RED;
 *   3. return a wrong shape from a forward → the marker assertion fails → RED;
 *   4. point a family at a closed port → every capability of that family becomes
 *      `unmeasured`, never `present` → RED on the present count.
 *
 * USAGE
 *   node verify/parity.mjs                 # offline, in-process, always runnable
 *   node verify/parity.mjs --live          # also probe the running host on 3083
 *   node verify/parity.mjs --live=<origin> # ... on another origin
 *
 * EXIT CODES
 *   0  every check passed and the capability denominator was non-zero
 *   1  at least one check failed
 *   3  BLINDED: the denominator was 0/0 — a scan that cannot see its subject is
 *      instrument failure, not a pass
 */

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Readable } from 'node:stream'

import { apply, CAPABILITIES, CENSUS_ADOPTION, CONSIDERED_NOT_FUSED, ENGINE_OPERATIONS, EXCLUDED_MEMBERS, FAMILIES, FUSED_BEYOND_CENSUS, ROUTE_METHODS, ROUTE_PATHS, ROUTE_PREFIX } from '../lib/index.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const PLUGIN_DIR = join(HERE, '..')
const CLONES = join(PLUGIN_DIR, '..')
// The program workspace, which owns `research/fusion-census.json`.
const WORKSPACE = join(CLONES, '..', 'profiles-tree', 'personal-dev', 'dsh-meta-evolve_INIT_WORKSPACE')

const argv = process.argv.slice(2)
const liveArg = argv.find(arg => arg === '--live' || arg.startsWith('--live='))
const LIVE_ORIGIN = liveArg === undefined
  ? null
  : (liveArg.includes('=') ? liveArg.slice('--live='.length) : (process.env['META_SKILLS_LIVE_ORIGIN'] ?? 'http://127.0.0.1:3083'))

/** The moment this run's census was taken; printed with every count. */
const CENSUS_AT = new Date().toISOString()

/** Every result, in execution order. The pass count and the FAIL list both derive from THIS. */
const results = []

/**
 * Run one check and record it.
 *
 * `check()` records its own outcome, so a call site cannot run a check and
 * discard it: the only way to check something is to pass a thunk to this
 * function, and this function always pushes.
 *
 * @param name - what the check asserts, in one line.
 * @param fn - the assertion; throwing fails the check, returning a string is its detail.
 */
async function check(name, fn) {
  try {
    const detail = await fn()
    results.push({ name, ok: true, detail: detail ?? '' })
  } catch (error) {
    results.push({ name, ok: false, detail: error instanceof Error ? error.message : String(error) })
  }
}

/** Throw unless `condition` holds. */
function need(condition, message) {
  if (!condition) throw new Error(message)
}

/** sha256 of a file, so a report binds to exact bytes. */
function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

/** Read one member source file. */
function memberFile(member, relative) {
  return join(CLONES, member, relative)
}

/** `file:line` from a ledger citation. */
function splitCitation(citation) {
  const at = citation.lastIndexOf(':')
  return { file: citation.slice(0, at), line: Number.parseInt(citation.slice(at + 1), 10) }
}

// ---------------------------------------------------------------- the fixture origin
//
// A fake deployment that impersonates EVERY member prefix. Every response
// carries a `marker` naming the upstream path that produced it, so a
// mis-forwarded capability returns the WRONG MARKER and fails loudly instead of
// returning a plausible body from the wrong member.

const UPSTREAM_HITS = []

function readRequestBody(req) {
  return new Promise(resolve => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

const fakeOrigin = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://fixture.invalid')
  const pathname = url.pathname
  const json = (status, body) => {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(body))
  }
  UPSTREAM_HITS.push(`${req.method} ${pathname}`)

  // The skill channel: POST only, a valid RPC envelope, and authenticated.
  if (pathname.startsWith(`${FAMILIES.skills.upstreamBase}/`)) {
    const endpoint = pathname.slice(FAMILIES.skills.upstreamBase.length + 1)
    const cookie = String(req.headers['cookie'] ?? '')
    if (!cookie.includes('fixture-auth')) {
      // Byte-faithful to plugin.mjs:2210-2214 — the fence runs BEFORE the method,
      // which is why the probe rule is `status !== 404`.
      res.writeHead(401, { 'content-type': 'text/plain' })
      res.end('unauthorized')
      return
    }
    if (req.method !== 'POST') {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('not found')
      return
    }
    let body
    try {
      body = JSON.parse(await readRequestBody(req))
    } catch {
      json(400, { error: 'fixture: body is not JSON' })
      return
    }
    if (body?.type !== 'client-request' || typeof body.rpcId !== 'string' || body.method !== endpoint) {
      json(400, { error: 'fixture: invalid client-request message', got: { type: body?.type, method: body?.method, endpoint } })
      return
    }
    json(200, { type: 'server-response', rpcId: body.rpcId, result: { ok: true, marker: `skills:${endpoint}` } })
    return
  }

  // The gate surface: `/tools-skills-evolve/api/<rest>`.
  if (pathname.startsWith(`${FAMILIES.tools.upstreamBase}/`)) {
    const rest = pathname.slice(FAMILIES.tools.upstreamBase.length + 1)
    json(200, { ok: true, marker: `tools:${rest}`, method: req.method })
    return
  }

  // The recall console: `/recall-console/api/<rest>`.
  if (pathname.startsWith(`${FAMILIES.recall.upstreamBase}/`)) {
    const rest = pathname.slice(FAMILIES.recall.upstreamBase.length + 1)
    json(200, { ok: true, marker: `recall:${rest}`, method: req.method })
    return
  }

  // The pipeline console: `/evolution/api/<rest>`.
  if (pathname.startsWith(`${FAMILIES.pipeline.upstreamBase}/`)) {
    const rest = pathname.slice(FAMILIES.pipeline.upstreamBase.length + 1)
    json(200, { ok: true, marker: `pipeline:${rest}`, method: req.method })
    return
  }

  // The skill studio: `/skill-studio/api/<rest>`.
  if (pathname.startsWith(`${FAMILIES.studio.upstreamBase}/`)) {
    const rest = pathname.slice(FAMILIES.studio.upstreamBase.length + 1)
    json(200, { ok: true, marker: `studio:${rest}`, method: req.method })
    return
  }

  json(404, { ok: false, error: 'fixture: no such upstream route', path: pathname })
})

await new Promise(resolve => fakeOrigin.listen(0, '127.0.0.1', resolve))
const FIXTURE_ORIGIN = `http://127.0.0.1:${fakeOrigin.address().port}`

// ---------------------------------------------------------------- mounting the fused surface

/** Build a fake Host context that records the one registration it is given. */
function mountFused(config) {
  const registrations = []
  const ctx = {
    webServer: { register(route) { registrations.push(route); return () => {} } },
    effect(callback) { callback() },
    logger: { info() {}, warn() {} },
  }
  apply(ctx, config)
  need(registrations.length === 1, `expected exactly ONE route registration, got ${registrations.length}`)
  need(registrations[0].kind === 'prefix', `expected kind 'prefix', got '${registrations[0].kind}'`)
  need(registrations[0].path === ROUTE_PREFIX, `expected prefix ${ROUTE_PREFIX}, got ${registrations[0].path}`)
  return registrations[0].handler
}

/** Drive one request through the fused handler. */
async function drive(handler, method, path, body, headers = {}) {
  const payload = body === undefined || body === null ? [] : [Buffer.from(typeof body === 'string' ? body : JSON.stringify(body))]
  const req = Readable.from(payload)
  req.method = method
  req.url = path
  req.headers = { host: '127.0.0.1:3083', cookie: 'fixture-auth=1', ...headers }
  if (body !== undefined && body !== null) req.headers['content-type'] = 'application/json'
  const chunks = []
  const res = {
    status: 0,
    headers: {},
    writeHead(status, responseHeaders) { this.status = status; this.headers = responseHeaders ?? {} },
    end(buffer) { if (buffer !== undefined) chunks.push(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)) },
  }
  await handler(req, res)
  const text = Buffer.concat(chunks).toString('utf8')
  let json = null
  try { json = JSON.parse(text) } catch { /* a non-JSON body is a legitimate failure to report */ }
  return { status: res.status, text, json, headers: res.headers }
}

const handler = mountFused({
  familyBases: { skills: FIXTURE_ORIGIN, tools: FIXTURE_ORIGIN, recall: FIXTURE_ORIGIN, pipeline: FIXTURE_ORIGIN, studio: FIXTURE_ORIGIN },
  timeoutMs: 5000,
})

// ---------------------------------------------------------------- A. the ledger closes

const routeCapabilities = CAPABILITIES.filter(capability => capability.kind === 'route')
const seatCapabilities = CAPABILITIES.filter(capability => capability.kind === 'seat')
const inProcessCapabilities = CAPABILITIES.filter(capability => capability.kind === 'in-process')

await check('ledger: the three capability kinds close to the total', async () => {
  const total = CAPABILITIES.length
  const parts = routeCapabilities.length + seatCapabilities.length + inProcessCapabilities.length
  need(total > 0, 'the ledger is empty — 0/0 is BLINDED, not a pass')
  need(parts === total, `${parts} parts != ${total} total`)
  return `${routeCapabilities.length} route + ${seatCapabilities.length} seat + ${inProcessCapabilities.length} in-process = ${total}`
})

await check('dispatch: ROUTE_PATHS, ROUTE_METHODS and the ledger are three encodings of ONE fact and agree row for row', async () => {
  const tableNames = Object.keys(ROUTE_PATHS)
  need(tableNames.length === routeCapabilities.length, `the dispatch table declares ${tableNames.length} routes, the ledger ${routeCapabilities.length}`)
  const mismatched = []
  for (const capability of routeCapabilities) {
    const name = Object.keys(ROUTE_METHODS).find(key => ROUTE_PATHS[key] === capability.fusedPath)
    if (name === undefined) { mismatched.push(`${capability.id}: ${capability.fusedPath} is not in ROUTE_PATHS`); continue }
    if (ROUTE_METHODS[name] !== capability.verb) mismatched.push(`${capability.id}: verb ${capability.verb} in the ledger, ${ROUTE_METHODS[name]} in ROUTE_METHODS`)
  }
  need(mismatched.length === 0, `${mismatched.length} disagreement(s): ${mismatched.join('; ')}`)
  return `${tableNames.length}/${routeCapabilities.length} rows agree in path and verb`
})

// ---------------------------------------------------------------- B. the population, recounted from the members' OWN source

await check('population: skills channel methods recounted from dsh-skill-evolution/plugin.mjs', async () => {
  const source = readFileSync(memberFile(FAMILIES.skills.member, 'plugin.mjs'), 'utf8').split('\n')
  // The `switch (endpoint)` inside handleRpc: from its declaration to the next
  // top-level function boundary. A range rather than the whole file, because
  // `case '<name>'` also appears in the tuning parser (plugin.mjs:582-593).
  const start = source.findIndex(line => line.includes('async function handleRpc(endpoint, payload, signal)'))
  need(start > 0, 'handleRpc was not found in plugin.mjs')
  let end = source.length
  for (let index = start + 1; index < source.length; index += 1) {
    if (/^  (async )?function /.test(source[index])) { end = index; break }
  }
  const found = new Set()
  for (let index = start; index < end; index += 1) {
    const match = /^\s{6}case '([A-Za-z]+)':/.exec(source[index])
    if (match !== null) found.add(match[1])
  }
  const declared = routeCapabilities.filter(capability => capability.family === 'skills').map(capability => capability.id.split('.').pop())
  const missing = declared.filter(name => !found.has(name))
  const extra = [...found].filter(name => !declared.includes(name))
  need(found.size > 0, 'the recount found NO channel methods — an instrument that cannot see its subject is failure, not a pass')
  need(missing.length === 0, `declared but NOT in the member's dispatch table: ${missing.join(', ')}`)
  need(extra.length === 0, `present in the member but NOT in the ledger: ${extra.join(', ')}`)
  return `${found.size}/${found.size} channel methods, ledger and member agree (plugin.mjs:${start + 1}-${end})`
})

await check('population: gate routes recounted from dsh-tools-skills-evolve/src/host/routes.ts', async () => {
  const source = readFileSync(memberFile(FAMILIES.tools.member, 'src/host/routes.ts'), 'utf8')
  const found = new Set([...source.matchAll(/path === ROUTE_PATHS\.([A-Za-z]+)/g)].map(match => match[1]))
  need(found.size > 0, 'the recount found NO gate routes')
  const declared = routeCapabilities.filter(capability => capability.family === 'tools')
  need(declared.length === found.size, `ledger declares ${declared.length} gate routes, the member dispatches ${found.size} (${[...found].join(', ')})`)
  return `${found.size}/${found.size} gate routes agree (${[...found].join(', ')})`
})

await check('population: pipeline routes recounted from dsh-evolution-console/src/host/routes.ts', async () => {
  const source = readFileSync(memberFile(FAMILIES.pipeline.member, 'src/host/routes.ts'), 'utf8')
  const found = new Set([...source.matchAll(/route === '([a-z/]+)'/g)].map(match => match[1]))
  need(found.size > 0, 'the recount found NO pipeline routes')
  const declared = routeCapabilities.filter(capability => capability.family === 'pipeline').length
  need(declared === found.size, `ledger declares ${declared} pipeline routes, the member dispatches ${found.size} (${[...found].join(', ')})`)
  return `${found.size}/${found.size} pipeline routes agree (${[...found].join(', ')})`
})

await check('population: recall routes recounted from dsh-recall-console/src/host/routes.ts', async () => {
  const source = readFileSync(memberFile(FAMILIES.recall.member, 'src/host/routes.ts'), 'utf8')
  const found = new Set([...source.matchAll(/route === '([a-z/-]+)'/g)].map(match => match[1]))
  need(found.size > 0, 'the recount found NO recall routes')
  const declared = routeCapabilities.filter(capability => capability.family === 'recall').length
  need(declared === found.size, `ledger declares ${declared} recall routes, the member dispatches ${found.size} (${[...found].join(', ')})`)
  return `${found.size}/${found.size} recall routes agree (${[...found].join(', ')})`
})

await check('population: studio routes recounted from dsh-skill-studio/src/host/routes.ts', async () => {
  // THIS MEMBER DISPATCHES BY ARRAY INDEX, NOT BY NAME. `path === ROUTE_PATHS[n]`
  // is its whole dispatch table, so the recount collects the INDICES and requires
  // them to be exactly 0..n-1 with no gap: a member that inserts a route in the
  // middle moves every index after it, and a recount that only counted matches
  // would agree with a stale ledger while the paths had silently shifted.
  const source = readFileSync(memberFile(FAMILIES.studio.member, 'src/host/routes.ts'), 'utf8')
  const found = [...new Set([...source.matchAll(/path === ROUTE_PATHS\[(\d+)\]/g)].map(match => Number(match[1])))].sort((a, b) => a - b)
  need(found.length > 0, 'the recount found NO studio routes — an instrument that cannot see its subject is failure, not a pass')
  const gaps = found.filter((index, position) => index !== position)
  need(gaps.length === 0, `the dispatch indices are not contiguous from 0: ${found.join(', ')}`)
  const declared = routeCapabilities.filter(capability => capability.family === 'studio')
  need(declared.length === found.length, `ledger declares ${declared.length} studio routes, the member dispatches ${found.length} (indices ${found.join(', ')})`)
  // The paths the indices resolve to, checked against the member's own array.
  const arrayBlock = source.slice(source.indexOf('export const ROUTE_PATHS'), source.indexOf('export const STATE_PATH'))
  const memberPaths = [...arrayBlock.matchAll(/'\/skill-studio\/api\/([a-z]+)'/g)].map(match => match[1]).sort()
  const ledgerTails = declared.map(capability => capability.upstreamPath.slice(`${FAMILIES.studio.upstreamBase}/`.length)).sort()
  need(JSON.stringify(memberPaths) === JSON.stringify(ledgerTails), `the member's path array is ${memberPaths.join(', ')} but the ledger declares ${ledgerTails.join(', ')}`)
  return `${found.length}/${found.length} studio routes agree, indices contiguous 0-${found.length - 1}, paths match the member's own array`
})

await check('population: engine routes recounted from the DRIVER operation table', async () => {
  // The engine family has no HTTP member to recount, so the population is recounted
  // from the thing that serves it: the driver's own operation table. The ledger and
  // the table must agree row for row, and the file each row names must be the engine
  // module the row CITES — otherwise a row could advertise a driver entry point the
  // driver does not have, which is the describe-don't-drive defect in the ledger.
  const declared = routeCapabilities.filter(capability => capability.family === 'engine')
  const table = Object.keys(ENGINE_OPERATIONS)
  need(table.length > 0, 'the driver declares NO engine operations — an instrument that cannot see its subject is failure, not a pass')
  need(declared.length === table.length, `the ledger declares ${declared.length} engine routes, the driver serves ${table.length} (${table.join(', ')})`)
  const mismatched = []
  for (const name of table) {
    const operation = ENGINE_OPERATIONS[name]
    const row = declared.find(capability => capability.fusedPath === operation.fusedPath)
    if (row === undefined) { mismatched.push(`${name}: ${operation.fusedPath} is not in the ledger`); continue }
    if (row.verb !== operation.verb) mismatched.push(`${name}: verb ${row.verb} in the ledger, ${operation.verb} in the driver`)
    if (!row.citation.startsWith(operation.file + ':')) mismatched.push(`${name}: cited ${row.citation}, driver serves ${operation.file}`)
  }
  need(mismatched.length === 0, `${mismatched.length} disagreement(s): ${mismatched.join('; ')}`)
  return `${table.length}/${table.length} engine routes agree with the driver, each citing the module it drives`
})

// ---------------------------------------------------------------- C. every citation resolves

await check('citations: every declared capability cites a live line in its member', async () => {
  const unresolved = []
  for (const capability of CAPABILITIES) {
    const { file, line } = splitCitation(capability.citation)
    try {
      const lines = readFileSync(memberFile(capability.member, file), 'utf8').split('\n')
      const cited = lines[line - 1]
      if (cited === undefined || !cited.includes(capability.citedToken)) {
        unresolved.push(`${capability.id} → ${capability.citation} does not contain ${JSON.stringify(capability.citedToken)}`)
      }
    } catch (error) {
      unresolved.push(`${capability.id} → ${capability.member}/${file} could not be read (${error instanceof Error ? error.message : String(error)})`)
    }
  }
  need(unresolved.length === 0, `${unresolved.length} unresolved:\n    ${unresolved.join('\n    ')}`)
  return `${CAPABILITIES.length}/${CAPABILITIES.length} citations resolve`
})

// ---------------------------------------------------------------- D. every route capability, DRIVEN through the fused surface

const driven = []

for (const capability of routeCapabilities) {
  await check(`drive: ${capability.id} (${capability.verb} ${capability.fusedPath})`, async () => {
    const body = capability.verb === 'POST'
      ? (capability.family === 'skills'
        // The member requires the path segment and the envelope's `method` to agree.
        ? { type: 'client-request', rpcId: `parity-${capability.id}`, method: capability.fusedPath.split('/').pop(), payload: { args: {} } }
        : {})
      : null
    const answer = await drive(handler, capability.verb, `${ROUTE_PREFIX}${capability.fusedPath}`, body)
    need(answer.status === 200, `expected 200, got ${answer.status}: ${answer.text.slice(0, 200)}`)
    need(answer.json !== null, `body is not JSON: ${answer.text.slice(0, 200)}`)
    if (capability.family === 'engine') {
      // THE DRIVEN ROUTES ARE CHECKED AGAINST THE DRIVER, NOT AGAINST A FIXTURE. A
      // forwarding row is proven by the member's own marker; these rows have no member
      // marker to compare, so the proof is that the answer came from the engine FILE the
      // driver names, carrying the engine's own value. 0/0 cannot pass this: a body with
      // no `servedBy` fails, and `ok` must be the driver's literal true.
      const operationName = Object.keys(ROUTE_PATHS).find(key => ROUTE_PATHS[key] === capability.fusedPath)
      need(operationName !== undefined, `${capability.fusedPath} is not in ROUTE_PATHS`)
      const expectedFile = ENGINE_OPERATIONS[operationName].file
      need(answer.json.ok === true, `the driver refused: ${answer.text.slice(0, 300)}`)
      need(answer.json.servedBy === expectedFile, `servedBy is ${String(answer.json.servedBy)}, expected ${expectedFile}`)
      need(answer.json.value !== undefined && answer.json.value !== null, 'the body carries no engine value')
      driven.push(capability.id)
      return `${answer.status} ${expectedFile}`
    }
    const expected = capability.family === 'skills'
      ? `skills:${capability.fusedPath.split('/').pop()}`
      : `${capability.family}:${capability.upstreamPath.slice(FAMILIES[capability.family].upstreamBase.length + 1)}`
    const marker = capability.family === 'skills' ? answer.json.result?.marker : answer.json.marker
    need(marker === expected, `marker mismatch: expected ${expected}, got ${String(marker)} — the request did not reach the member route this row declares`)
    driven.push(capability.id)
    return `${answer.status} ${expected}`
  })
}

// ---------------------------------------------------------------- E. seat capabilities reach their family through the fused entry

const clientSource = readFileSync(join(PLUGIN_DIR, 'src', 'client', 'index.tsx'), 'utf8')
const clientApi = readFileSync(join(PLUGIN_DIR, 'src', 'client', 'api.ts'), 'utf8')

await check('seat: the fused client registers exactly ONE sidebar entry, under its OWN keyed id', async () => {
  const rowId = /export const META_SKILLS_ROW_ID = '([^']+)'/.exec(clientSource)
  const mainKey = /export const META_SKILLS_MAIN_KEY = '([^']+)'/.exec(clientSource)
  need(rowId !== null, 'META_SKILLS_ROW_ID is not declared')
  need(mainKey !== null, 'META_SKILLS_MAIN_KEY is not declared')
  need(rowId[1] === mainKey[1], `the row id ${rowId[1]} and the main key ${mainKey[1]} differ — the click would throw`)
  const memberIds = ['skill-evolution', 'recall-console', 'evolution-console', 'dsh-tools-skills-evolve:evolve', 'dsh-skill-studio:studio']
  need(!memberIds.includes(rowId[1]), `the fused entry reuses a MEMBER's id (${rowId[1]}) — that shadows the thing the fusion claims to preserve`)
  need(rowId[1] === 'dsh-meta-skills:skills', `the fused entry's id is ${rowId[1]}, not this plugin's own keyed id`)
  const slotNames = [...clientSource.matchAll(/slots\.inject\('([^']+)'/g)].map(match => match[1])
  need(slotNames.length === 2, `expected exactly two slot injections, found ${slotNames.length}: ${slotNames.join(', ')}`)
  need(slotNames.includes('main') && slotNames.includes('sidebar.panellist'), `expected main + sidebar.panellist, got ${slotNames.join(', ')}`)
  need(!slotNames.includes('settings.section'), 'the fused entry occupies the members\' settings.section seat, which is theirs')
  need(!/\bpriority\s*:/.test(clientSource), 'a `priority` is registered; the entry must ADD a row and never shadow a cell')
  return `row id ${rowId[1]} === main key; slots: ${slotNames.join(' + ')}; no priority`
})

await check('seat: the fused page reaches EVERY declared family through the fused prefix', async () => {
  // Derived from FAMILIES, not from a hand-written list: a family added to the
  // ledger whose tab never addresses it would otherwise pass this check silently,
  // which is exactly the "a check whose input is missing is OMITTED rather than
  // refused" defect this program has recorded.
  const families = Object.keys(FAMILIES)
  need(families.length >= 5, `only ${families.length} families declared; the studio is the fifth`)
  for (const family of families) {
    need(clientApi.includes(`/api/${family}/`) || clientApi.includes(`/api/\${family}/`), `the client api module never addresses /api/${family}/`)
  }
  need(clientApi.includes('ROUTE_PREFIX'), 'the client api module does not build its paths from the shared ROUTE_PREFIX')
  return `${families.join(' + ')} all addressed via ROUTE_PREFIX`
})

// ---------------------------------------------------------------- F. the 404 body is OUR OWN

await check('404: an unknown fused path answers with THIS plugin\'s body', async () => {
  const answer = await drive(handler, 'GET', `${ROUTE_PREFIX}/api/nope`)
  need(answer.status === 404, `expected 404, got ${answer.status}`)
  need(answer.json !== null, `the 404 body is not JSON: ${answer.text.slice(0, 200)}`)
  need(answer.json.fused === 'dsh-meta-skills', `the 404 body is not ours: ${answer.text.slice(0, 200)}`)
  need(answer.json.error === 'unknown meta-skills route', `unexpected error label: ${String(answer.json.error)}`)
  need(answer.json.path === `${ROUTE_PREFIX}/api/nope`, `the 404 body does not quote the path received: ${String(answer.json.path)}`)
  need(typeof answer.json.see === 'string' && answer.json.see.includes('/api/capabilities'), 'the 404 body does not point at the ledger')
  return `404 fused=dsh-meta-skills path=${answer.json.path}`
})

await check('404: a foreign path is refused by the prefix guard, not by a member', async () => {
  const answer = await drive(handler, 'POST', '/skill-evolution/list', { type: 'client-request', rpcId: 'x', method: 'list', payload: { args: {} } })
  need(answer.status === 404, `expected 404 for a foreign path, got ${answer.status}`)
  need(answer.json?.fused === 'dsh-meta-skills', `a foreign path was answered by someone else: ${answer.text.slice(0, 200)}`)
  return 'foreign path refused with our own body'
})

// ---------------------------------------------------------------- G. the ledger over the live probes

await check('ledger@wire: present + unmeasured = total, with the in-process gap NAMED', async () => {
  const answer = await drive(handler, 'GET', `${ROUTE_PREFIX}/api/capabilities`)
  need(answer.status === 200, `expected 200, got ${answer.status}`)
  const body = answer.json
  need(body !== null, 'the ledger body is not JSON')
  need(body.counts.total === CAPABILITIES.length, `wire total ${body.counts.total} != ledger ${CAPABILITIES.length}`)
  need(body.counts.present + body.counts.unmeasured === body.counts.total, `present ${body.counts.present} + unmeasured ${body.counts.unmeasured} != total ${body.counts.total}`)
  need(body.counts.present === body.counts.total - 1, `expected exactly one unmeasured capability with the fixture origin up, got ${body.counts.unmeasured}`)
  const gap = body.capabilities.filter(capability => capability.status === 'unmeasured')
  need(gap.length === 1, `expected 1 unmeasured row, got ${gap.length}`)
  need(typeof gap[0].reason === 'string' && gap[0].reason.length > 20, 'the unmeasured row carries no reason — an unmeasured value without its reason is a zero with an alibi')
  need(gap[0].id === 'skills.service.skillSelection', `the unmeasured row is ${gap[0].id}, not the in-process service`)
  need(body.censusAt !== undefined, 'the ledger carries no census time')
  return `${body.counts.present}/${body.counts.total} present, 1 unmeasured (${gap[0].id}) at ${body.censusAt}`
})

await check('absence: with the members unreachable NOTHING is reported present', async () => {
  // A second mount pointed at a closed port. Every capability must degrade to
  // `unmeasured` WITH a reason; a `present` here would mean the report invented a
  // reading it did not take.
  const closed = mountFused({ familyBases: { skills: 'http://127.0.0.1:1', tools: 'http://127.0.0.1:1', recall: 'http://127.0.0.1:1', pipeline: 'http://127.0.0.1:1', studio: 'http://127.0.0.1:1' }, timeoutMs: 1500 })
  const answer = await drive(closed, 'GET', `${ROUTE_PREFIX}/api/capabilities`)
  need(answer.status === 200, `expected 200 (the read succeeded; the DATA is unavailable), got ${answer.status}`)
  const body = answer.json
  need(body.counts.present === 0, `${body.counts.present} capabilities reported PRESENT with no member reachable`)
  need(body.counts.unmeasured === body.counts.total, `${body.counts.unmeasured} unmeasured != ${body.counts.total} total`)
  const reasonless = body.capabilities.filter(capability => capability.status === 'unmeasured' && (typeof capability.reason !== 'string' || capability.reason === ''))
  need(reasonless.length === 0, `${reasonless.length} unmeasured rows carry no reason`)
  return `${body.counts.total}/${body.counts.total} unmeasured, 0 present, every row with a reason`
})

await check('health@wire: an unreachable member is `no reading`, never `fail` and never zero', async () => {
  const closed = mountFused({ familyBases: { skills: 'http://127.0.0.1:1', tools: 'http://127.0.0.1:1', recall: 'http://127.0.0.1:1', pipeline: 'http://127.0.0.1:1', studio: 'http://127.0.0.1:1' }, timeoutMs: 1500 })
  const answer = await drive(closed, 'GET', `${ROUTE_PREFIX}/api/health`)
  need(answer.status === 200, `expected 200, got ${answer.status}`)
  const body = answer.json
  // THE ENGINE FAMILY HAS NO HTTP PREFIX, so it cannot be probed over the wire and must
  // not be given a fake probe to keep a count tidy. Its liveness IS the four drive rows
  // above: each of them called a real engine export in process. The expectation is
  // therefore one probe per family WITH an upstream base, and which family is exempt is
  // asserted here rather than left silent — a silent exemption is how a probe quietly
  // stops being taken.
  const unprobed = Object.keys(FAMILIES).filter(family => FAMILIES[family].upstreamBase === '')
  need(JSON.stringify(unprobed) === JSON.stringify(['engine']), `${unprobed.length} families have no upstream base (${unprobed.join(', ')}); exactly one — engine — is served in process`)
  const expectedProbes = Object.keys(FAMILIES).length - unprobed.length
  need(body.answered.probed === expectedProbes, `probed ${body.answered.probed} members, expected ${expectedProbes} (one per family with a real upstream prefix; engine is in process)`)
  need(body.answered.count === 0, `${body.answered.count} members answered a probe against a closed port`)
  need(body.members.every(member => member.reachable === null), 'a member is reported reachable:false rather than null — absent-a-reading is not a failure')
  need(body.members.every(member => typeof member.reason === 'string' && member.reason.startsWith('no reading')), 'an unread member carries no `no reading` reason')
  return `${body.answered.count}/${body.answered.probed} answered, ALL reported as no-reading with reasons`
})

await check('health@wire: with the fixture up, every declared member answers', async () => {
  const answer = await drive(handler, 'GET', `${ROUTE_PREFIX}/api/health`)
  need(answer.status === 200, `expected 200, got ${answer.status}`)
  const unprobed = Object.keys(FAMILIES).filter(family => FAMILIES[family].upstreamBase === '')
  const expectedProbes = Object.keys(FAMILIES).length - unprobed.length
  need(expectedProbes === 5, `expected 5 HTTP families, got ${expectedProbes}`)
  need(answer.json.answered.count === expectedProbes, `${answer.json.answered.count}/${expectedProbes} members answered`)
  return `${answer.json.answered.count}/${answer.json.answered.probed} answered at ${answer.json.censusAt}`
})

// ---------------------------------------------------------------- H. the excluded member, with its evidence

await check('membership: the census cluster C5 was ADOPTED, and the reversal is recorded where it happened', async () => {
  need(EXCLUDED_MEMBERS.length === 0, `${EXCLUDED_MEMBERS.length} members are still excluded; the census put all four inside C5`)
  const adoption = CENSUS_ADOPTION
  need(adoption.cluster === 'C5', `the adoption record names cluster ${adoption.cluster}, not C5`)
  const censusPath = join(WORKSPACE, adoption.source)
  const census = JSON.parse(readFileSync(censusPath, 'utf8'))
  const cluster = census.intentClusters.find(entry => entry.id === adoption.cluster)
  need(cluster !== undefined, `the census file has no cluster ${adoption.cluster}`)
  const members = new Set(CAPABILITIES.map(capability => capability.member))
  const missing = cluster.members.filter(member => !members.has(member))
  need(missing.length === 0, `the census's C5 names ${cluster.members.length} members; ${missing.length} are absent from the ledger: ${missing.join(', ')}`)
  // THE DENOMINATOR IS C5 PLUS THE DECISION-FUSED EXTRA, and both directions are
  // asserted. Replacing this equality with "at least the cluster's members" would
  // have turned a real check into a floor; instead every member beyond C5 must be
  // DECLARED in FUSED_BEYOND_CENSUS with its own authority, so an undeclared extra
  // member still fails, and a declared one that never reached the ledger fails too.
  need(FUSED_BEYOND_CENSUS.length > 0, 'no decision-fused member is recorded, yet the ledger has members outside C5')
  const beyond = FUSED_BEYOND_CENSUS.map(row => row.member)
  for (const member of beyond) {
    need(members.has(member), `FUSED_BEYOND_CENSUS declares ${member}, which is NOT in the ledger`)
    need(typeof FUSED_BEYOND_CENSUS.find(row => row.member === member).why === 'string', `${member} carries no reason for being fused beyond the census`)
  }
  const inCluster = new Set([...members].filter(member => cluster.members.includes(member)))
  const beyondLedger = [...members].filter(member => !cluster.members.includes(member))
  need(inCluster.size === cluster.members.length, `this ledger composes ${inCluster.size} of the census's ${cluster.members.length} C5 members`)
  need(beyondLedger.length === beyond.length, `${beyondLedger.length} members sit outside C5 but only ${beyond.length} are declared in FUSED_BEYOND_CENSUS (${beyondLedger.join(', ')})`)
  need(typeof adoption.why === 'string' && adoption.why.length > 40, 'the adoption carries no reason')
  need(typeof adoption.was === 'string' && adoption.was.includes('three members'), 'the adoption does not record what this lane measured first')
  need(CONSIDERED_NOT_FUSED.length === 2, `expected 2 considered-and-declined neighbours (the studio left this list when D-0357 fused it), got ${CONSIDERED_NOT_FUSED.length}`)
  const considered = CONSIDERED_NOT_FUSED.map(row => row.member)
  const accidental = considered.filter(member => CAPABILITIES.some(capability => capability.member === member))
  need(accidental.length === 0, `a declined neighbour is in the ledger: ${accidental.join(', ')}`)
  for (const row of CONSIDERED_NOT_FUSED) {
    need(typeof row.why === 'string' && row.why.length > 40, `${row.member} carries no reason for being declined`)
  }
  return `${cluster.id} ${cluster.label}: ${cluster.members.length}/${cluster.members.length} census members fused + ${beyond.length} fused on a decision (${beyond.join(', ')}); 0 excluded; ${CONSIDERED_NOT_FUSED.length} declined WITH reasons; reversal recorded`
})

// ---------------------------------------------------------------- I. optional live probe

if (LIVE_ORIGIN !== null) {
  const cookie = process.env['META_SKILLS_COOKIE'] ?? ''
  await check(`live: ${LIVE_ORIGIN}${ROUTE_PREFIX}/api/capabilities answers 200 JSON`, async () => {
    const response = await fetch(`${LIVE_ORIGIN}${ROUTE_PREFIX}/api/capabilities`, {
      headers: cookie === '' ? {} : { cookie },
      signal: AbortSignal.timeout(15000),
    })
    const text = await response.text()
    need(response.status === 200, `expected 200, got ${response.status}: ${text.slice(0, 300)}`)
    need(String(response.headers.get('content-type') ?? '').includes('json'), `content-type is ${String(response.headers.get('content-type'))}`)
    const body = JSON.parse(text)
    need(body.fused === 'dsh-meta-skills', `the live 200 is not this plugin's: ${text.slice(0, 200)}`)
    need(body.counts.total === CAPABILITIES.length, `live total ${body.counts.total} != ${CAPABILITIES.length}`)
    return `${body.counts.present}/${body.counts.total} present live at ${body.censusAt}`
  })

  await check(`live: ${LIVE_ORIGIN} answers an unknown ${ROUTE_PREFIX} path with OUR 404 body`, async () => {
    const response = await fetch(`${LIVE_ORIGIN}${ROUTE_PREFIX}/api/parity-unknown`, {
      headers: cookie === '' ? {} : { cookie },
      signal: AbortSignal.timeout(15000),
    })
    const text = await response.text()
    need(response.status === 404, `expected 404, got ${response.status}: ${text.slice(0, 300)}`)
    const body = JSON.parse(text)
    need(body.fused === 'dsh-meta-skills', `the live 404 body is not ours: ${text.slice(0, 300)}`)
    return 'live 404 body is ours'
  })
}

// ---------------------------------------------------------------- the verdict

fakeOrigin.close()

const passed = results.filter(result => result.ok).length
const failed = results.filter(result => !result.ok)

// TWO ENCODINGS OF ONE FACT MUST NOT BE ABLE TO DISAGREE: the exit code derives
// from `failed.length`, and the printed FAILED list derives from the same array.
const recorded = results.length

console.log('dsh-meta-skills capability-parity harness')
console.log(`  artifact   lib/index.js  sha256 ${sha256(join(PLUGIN_DIR, 'lib', 'index.js'))}`)
console.log(`  artifact   lib/client.js sha256 ${sha256(join(PLUGIN_DIR, 'lib', 'client.js'))}`)
console.log(`  ledger     ${CAPABILITIES.length} capabilities (${routeCapabilities.length} route + ${seatCapabilities.length} seat + ${inProcessCapabilities.length} in-process)`)
console.log(`  census     ${CENSUS_AT}`)
console.log(`  upstream   ${UPSTREAM_HITS.length} fixture hits`)
console.log('')
for (const result of results) {
  console.log(`${result.ok ? 'ok  ' : 'FAIL'} — ${result.name}${result.detail === '' ? '' : `\n       ${result.detail}`}`)
}
console.log('')
console.log(`route capabilities DRIVEN through the fused surface: ${driven.length}/${routeCapabilities.length}`)
console.log(`capability parity: ${routeCapabilities.length + seatCapabilities.length}/${CAPABILITIES.length} capability kinds reachable or named-unmeasured as designed; in-process gap: ${inProcessCapabilities.length} (UNMEASURED with reason, by construction)`)
console.log(`checks: ${passed}/${recorded} passed, ${failed.length} failed (census ${CENSUS_AT})`)

if (recorded === 0) {
  console.log('VERDICT: BLINDED — no check ran, which is instrument failure and not a pass')
  process.exit(3)
}
if (CAPABILITIES.length === 0 || driven.length === 0) {
  console.log('VERDICT: BLINDED — 0/0 capabilities; a scan that cannot see its subject is not a pass')
  process.exit(3)
}
if (failed.length > 0) {
  console.log(`VERDICT: FAIL — ${failed.length} of ${recorded} checks failed: ${failed.map(result => result.name).join('; ')}`)
  process.exit(1)
}
console.log(`VERDICT: PASS — ${passed}/${recorded} checks, ${driven.length}/${routeCapabilities.length} route capabilities driven, census ${CENSUS_AT}`)
process.exit(0)
