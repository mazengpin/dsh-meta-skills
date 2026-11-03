# dsh-meta-skills

> **Status: PRE-RELEASE `0.9.0` — under active development.** This package is published on the `next` dist-tag, not `latest`.
> Its API, wire records and panel contracts may change between `0.9.x` releases, and each package carries its own `ROADMAP.md` naming what `1.0.0` still requires.
> A published tarball is a snapshot of a moving surface: read `ROADMAP.md` before depending on a shape.

One fused surface for the **skills / tools evolution family**: one route prefix (`/meta-skills`) and one sidebar entry, composing five member plugins while every member stays installed, registered and loaded.

Built under decision **`D-0352`** — *fuse behind ONE surface, prove capability parity, keep the members loaded, and never publish a number the fused surface cannot derive.*

## Install

**A consumer installs the published pre-release only.** This `0.9.0` tree is a source preview and is NOT an install path: what a consumer gets is the published tarball on the `next` dist-tag, and that tarball is the only install spec this package has.

```
pnpm add dsh-meta-skills@next
```

Then add `dsh-meta-skills` to `dsh.profile.bundles`. A bundles change hot-reloads; nothing else does, so a profile that has never listed this package needs a restart. The bundle patch `cordis.patch.yml` inserts exactly one loader row, `meta-skills`, and the row name equals the package name so the loader resolves the package's `.` export (`lib/index.js`).

Members are NOT bundled by this package. Install and enable the members you want; each keeps its own row in the profile's bundle list. This package never mounts, replaces or unmounts them.

## Developing it

**The steps below are for DEVELOPING this package. They are not an install path**, and a profile that consumes a linked tree is consuming your build rather than a release.

Clone the repository into `plugins-src/dsh-meta-skills` (the clone URL is set by the release owner alongside the published tarball, and is deliberately not printed here), then:

```
cd plugins-src/dsh-meta-skills
pnpm install
pnpm run check          # typecheck + build + parity harness
```

Link a developing profile at it with a **relative** `link:`, never an absolute path — in that profile's `package.json`:

```
"dependencies": { "dsh-meta-skills": "link:../../plugins-src/dsh-meta-skills" }
```

A link that points at a working tree is how a member is developed against, and it is the reason this package's own harness reads the BUILT `lib/index.js`: what a linked profile loads is what the harness grades.

## What it composes

| member | what it is | prefix it keeps |
|---|---|---|
| `dsh-skill-evolution` | traces → reviews → crystallized skills, plus the gate census | `/skill-evolution` |
| `dsh-tools-skills-evolve` | graded proposals, knobs, append-only promotion ledger | `/tools-skills-evolve/api` |
| `dsh-recall-console` | per-kind recall posture over the skill and tool vocabulary | `/recall-console/api` |
| `dsh-evolution-console` | operator console over the mined-capability pipeline | `/evolution/api` |
| `dsh-skill-studio` | stage → grade → promote over the scanned skill root, plus per-member skill masks | `/skill-studio/api` |

Membership is the census's for four of them (`research/fusion-census.json` cluster **C5**) and `D-0357`'s for `dsh-skill-studio`; both the adoption and the earlier refusal it reverses are recorded in `src/shared/protocol.ts` (`CENSUS_ADOPTION`, `FUSED_BEYOND_CENSUS`).

## What it serves

| path | verb | what it does |
|---|---|---|
| `/meta-skills/api/capabilities` | GET | the capability ledger — every declared capability, its fused path, its citation, its status **at this request** |
| `/meta-skills/api/health` | GET | one liveness probe per member, with its clock and observed status |
| `/meta-skills/api/skills/<method>` | POST | forwarded to `/skill-evolution/<method>` (the member's RPC envelope, unchanged) |
| `/meta-skills/api/tools/<rest>` | as sent | forwarded to `/tools-skills-evolve/api/<rest>` |
| `/meta-skills/api/recall/<rest>` | as sent | forwarded to `/recall-console/api/<rest>` |
| `/meta-skills/api/pipeline/<rest>` | as sent | forwarded to `/evolution/api/<rest>` |
| `/meta-skills/api/studio/<rest>` | as sent | forwarded to `/skill-studio/api/<rest>` |
| anything else under the prefix | any | **this plugin's own 404 body** (`fused: 'dsh-meta-skills'`, the path as received, a pointer to the ledger) |

A route is served only if it appears in `ROUTE_PATHS`; a declared path carries its declared verb (`ROUTE_METHODS`), and a wrong verb answers this plugin's own `405` rather than the member's.

## Composition, not copying

Each family namespace forwards to the member's own prefix on the originating request's own `Host` authority and hands the member's bytes back untouched — status, `content-type`, body. Hop-by-hop headers are dropped; `cookie` is forwarded deliberately, because `dsh-skill-evolution` runs `ctx.connection.admit(req)` before it inspects the method.

Nothing is re-implemented, so nothing can drift; nothing imports a member's route factory, so no second policy store is created.

## Verification

```
node verify/parity.mjs          # offline, in-process, always runnable
node verify/parity.mjs --live   # also probe the running host
node verify/control-live.mjs    # drive the control routes against a live host
```

Exit codes: `0` pass · `1` a check failed · `3` **BLINDED** (the denominator was `0/0`, which is instrument failure and never a pass).

`verify/parity.mjs` reads the ledger from the BUILT artifact (`lib/index.js`), recounts every member's population from that member's own dispatch tables, opens each cited `file:line` and requires the cited token to still be there, and drives every route capability through the fused prefix against a loopback fixture that stamps each response with the upstream path that produced it. The expected ratio is printed by the run itself, with numerator and denominator, and is not restated here: a number typed into a README goes stale exactly as an earlier revision of this one did.

## The one seat

`sidebar.panellist` row **`dsh-meta-skills:skills`** at order `6.45`, plus the keyed `main` panel with the **same** key. The id is this plugin's own, no `priority` is registered anywhere, and nothing registers into a member's `settings.section` seat — so this entry can only ever add a row.

## What this plugin does not do

- It deletes, disables or unregisters **nothing**. Uninstalling restores exactly the profile the owner had.
- It writes **no file** and owns no state; the members remain the only writers.
- It reaches no device and calls no model.

## Build outputs

`lib/index.js` (Host, ESM), `lib/client.js` + map (browser half). `lib/` is build output, shipped in `files` because a profile loads it, and not tracked in git.

MIT licensed — see [LICENSE](LICENSE).
