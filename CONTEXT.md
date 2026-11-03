# CONTEXT — dsh-meta-skills

Why this file exists: so a stranger can rebuild the reasoning around this package, not only its code. What it does today and what it does NOT do live in `DISCLOSURE.md`; what `1.0.0` still requires lives in `ROADMAP.md`.

## (a) The problem it solves

A DSH profile can install five plugins that all work on skills and tools: one traces and crystallizes skills, one grades and promotes proposals, one reports recall posture, one is an operator console over the mined-capability pipeline, and one stages and promotes over the scanned skill root.
Mounted separately they present five route prefixes and five panels for what an operator experiences as ONE decision: which skill is selected, what can be recalled, and what gets promoted.
The problem is therefore not missing function. It is that one decision is spread across five surfaces whose numbers do not have to agree.
`dsh-meta-skills` collapses the READ side of that decision: one prefix, one sidebar row, and one capability ledger stating for every declared member capability whether it is present, and never a zero where the reading is merely absent.

## (b) The context

Built inside the `dsh-meta-evolve` program under decision `D-0352`: fuse behind ONE surface, prove capability parity, keep the members loaded, and never publish a number the fused surface cannot derive.
The siblings are `dsh-skill-evolution`, `dsh-tools-skills-evolve`, `dsh-recall-console`, `dsh-evolution-console` and `dsh-skill-studio`; membership of the first four is the program census (`research/fusion-census.json`, cluster C5) and `dsh-skill-studio` is in on `D-0357`.
**The constraint that shaped this one is the ownership question.** `plugins-src/dsh-skill-evolution` already holds all four skill operations: `skill-select.mjs` (31,818 B), `skill-recall.mjs` (20,055 B), `skill-promote.mjs` (17,691 B) and `skill-store.mjs` (27,498 B), plus the evolve loop `skill-evolve-loop.mjs` (33,417 B).
So a fused package that implemented selection, recall, promotion or storage itself would create a second store holding a second set of rules for one decision, and the two copies would diverge exactly where the decision is made.
What this package was meant to add is therefore a **composition and a census**, not an engine: an entry that drives the existing writers and measures whether the family is still reachable.
**Whether it actually does: partly, and the limit is measured.** It drives and it censuses, and its own harness is RED at **55 of 57** checks, failing on member drift (named in `DISCLOSURE.md` section 2) rather than on a missing engine — the census caught the divergence it exists to catch.

## (c) Intent, and what was deliberately NOT attempted

Intent: make the claim that the skills / tools family is reachable into a MEASUREMENT, without owning any state to do it.
Deliberately NOT attempted: a second store, a second set of writer rules, a member route table copied by hand where it can be recounted, a `priority` on the sidebar row (it registers none), and any per-member `settings.section` seat (it registers none either, so this entry can only ever add a row).
Also deliberately NOT attempted: mounting, replacing or unmounting members. Each member keeps its own row in the profile bundle list, and uninstalling this package restores exactly the profile the owner had.
Not attempted, and **NOT RECORDED** as a decision: publishing under `latest`. The `next` dist-tag is what `package.json` declares, and no reasoning for refusing `latest` is written down anywhere in this package.

## (d) Alternatives considered, and why each was rejected

**Re-implement the four skill operations inside the fused package.** Rejected: a second store would be a second set of rules for one decision — stated as a limit in `ROADMAP.md`, and visible in the README sentence that this package writes no file and owns no state.
**Bundle the members as dependencies of this package.** Rejected: the members must stay installed, registered and loaded as themselves, so each keeps its own bundle row and this package mounts nothing.
**Exclude `dsh-recall-console` from the fusion.** Considered first, then REVERSED: the program census placed it inside cluster C5, and the standing rule is that the census is adopted when it contradicts a lane provisional reading. The reversal is recorded in `src/shared/protocol.ts` at `CENSUS_ADOPTION`, with the census sentence itself as the reason.
**Serve one prefix per family instead of one prefix for all five.** Rejected: a single prefix is what makes the surface fused rather than multiplied, and `/meta-skills` is that prefix.
**Let the fused layer derive its own skill root.** Not attempted here, because the decision belongs to the member that owns the root: `plugins-src/dsh-skill-studio/src/host/config.ts:12-16` records why it names ONE root rather than trying derived candidates. Whether the fused layer ever considered deriving one is **NOT RECORDED**.

## (e) Recreate a working environment, using only node, pnpm and git

1. `git clone <repository> dsh-meta-skills` — the clone URL is set by the release owner at publish time and is deliberately not printed inside this package.
2. `cd dsh-meta-skills`
3. `node --version` — must satisfy `engines.node`, which is `>=22`.
4. `pnpm install`
5. `pnpm run typecheck` — expect exit 0.
6. `pnpm run build` — expect exit 0; writes `lib/index.js`, `lib/client.js` and `lib/client.js.map`.
7. `node verify/parity.mjs` — offline, in-process, always runnable. Exit `0` pass, `1` a check failed, `3` BLINDED (a `0/0` denominator, which is instrument failure and never a pass).
8. `node verify/parity.mjs --live` — the same census plus a probe of a running host.
9. `node verify/control-live.mjs` — only when a host is running; it drives the control routes end to end.
10. To consume the tree from a developing profile, add `"dsh-meta-skills": "link:../../plugins-src/dsh-meta-skills"` to that profile `dependencies` (a relative `link:` only, never an absolute path) and list `dsh-meta-skills` in `dsh.profile.bundles`.
11. A bundles change hot-reloads; anything else needs a restart of the host.

## (f) What to read next

Start with `src/shared/protocol.ts`. Its module header is the design comment, and it is the single copy of the ledger: it explains why the ledger lives in the protocol rather than in the host, why every row carries a `citation` that the harness must still find on its line, and why the population is served at request time instead of typed into a comment.
Then `verify/parity.mjs` for what each check actually asserts, `src/host/routes.ts` for the forwarding and for who owns the `404` and `405` bodies, `src/host/capabilities.ts` for present-versus-unmeasured, and `src/client/index.tsx` for the single `sidebar.panellist` row.
`README.md` says what it serves, `DISCLOSURE.md` says what it does today and what it does NOT do, and `ROADMAP.md` says what `1.0.0` still requires.
