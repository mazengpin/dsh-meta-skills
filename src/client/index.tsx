/**
 * Client half of `dsh-meta-skills`.
 *
 * THREE REGISTRATIONS, AND THE PAIRING IS THE POINT:
 *
 *  1. this plugin's dictionary in the shared locale service;
 *  2. **ONE** nav row in `sidebar.panellist` — the fused family's single entry;
 *  3. **ONE** keyed `main` panel behind that row, because a row whose panel does
 *     not exist throws on the first click.
 *
 * THE SEAM TRAP THIS FILE IS WRITTEN AROUND, taken from `dsh-intent-map` via
 * `dsh-meta-market` because it is a property of the SLOT and not of any plugin:
 * **the row's `id` in `sidebar.panellist` must equal the panel's `key` in
 * `main`.** The two slots spell identity differently — the list builds its rows
 * from `options.id`, the keyed panel is matched on `entry.options.key` — so
 * {@link META_SKILLS_ROW_ID} and {@link META_SKILLS_MAIN_KEY} are two separate
 * declarations of one value, exported so the verifier asserts the equality
 * against the same declarations the runtime uses.
 *
 * THE ENTRY IS THIS PLUGIN'S OWN, AND THAT IS AN ACCEPTANCE CRITERION. The id and
 * the panel kind are keyed as `dsh-meta-skills:skills`: never a member's id
 * (`skill-evolution`, `recall-console`, `evolution-console`, or
 * `dsh-tools-skills-evolve:evolve`), because taking over a member's cell would
 * make the fusion LOOK complete by shadowing the thing it claims to preserve.
 * No `priority` is registered at all — the value that would shadow a shipped
 * occupant — so this entry can only ever ADD a row.
 *
 * WHY REGISTER THROUGH `slots.inject`. Both slots are declared by OTHER packages
 * (`ui-sidebar` declares `sidebar.panellist`, `ui-layout` declares `main`), and a
 * bare `register` into an undeclared slot throws at load. `inject` waits for the
 * real declaration instead of racing it.
 *
 * @module dsh-meta-skills/client
 */

import { createElement as h, type ReactElement } from 'react'
import { LOCALE_NS, en, zh } from './locales.ts'
import { MetaSkillsPage } from './MetaSkillsPage.tsx'
import type { ClientContext, Translator } from './types.ts'

/** Loader row name; the client bundle registers itself under this same id. */
export const name = 'dsh-meta-skills'

/** The two Client services this half reads. */
export const inject = ['slots', 'locale']

/** The `sidebar.panellist` row's `id`. */
export const META_SKILLS_ROW_ID = 'dsh-meta-skills:skills'

/** The `main` panel's `key`. MUST equal {@link META_SKILLS_ROW_ID}. */
export const META_SKILLS_MAIN_KEY = 'dsh-meta-skills:skills'

/**
 * Position among the global panel rows, ascending.
 *
 * Enumerated against the live neighbours rather than picked round: the two rows
 * this fusion speaks for are at **6.3** (`dsh-tools-skills-evolve:evolve`,
 * `src/client/index.tsx:77`) and **6.6** (`dsh-meta-market:market`,
 * `src/client/index.tsx:76`). 6.45 sits between them, addresses no existing cell,
 * and is a fraction rather than an integer so a later lane still has room.
 */
export const META_SKILLS_ROW_ORDER = 6.45

/**
 * The row's glyph: three seeds feeding one stem, drawn inline at the sibling's
 * stroke weight so the row does not look foreign in the sidebar.
 *
 * @returns the svg element.
 */
function MetaSkillsRowIcon({ size }: { size?: number }): ReactElement {
  return h(
    'svg',
    { width: size ?? 18, height: size ?? 18, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
    h('path', { d: 'M8 14V7.5', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }),
    h('path', { d: 'M8 7.5 3.5 4.5M8 7.5l4.5-3M3.5 4.5v2M12.5 4.5v2', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }),
    h('circle', { cx: 3.5, cy: 3.4, r: 1.1, stroke: 'currentColor', strokeWidth: 1.1 }),
    h('circle', { cx: 8, cy: 2.6, r: 1.1, stroke: 'currentColor', strokeWidth: 1.1 }),
    h('circle', { cx: 12.5, cy: 3.4, r: 1.1, stroke: 'currentColor', strokeWidth: 1.1 }),
  )
}

/**
 * Register the dictionary, the single nav row and the keyed main panel.
 *
 * @param ctx - the Client plugin context (`slots`, `locale`, `effect`, `logger`).
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(LOCALE_NS, 'en', en), 'dsh-meta-skills: en dictionary')
  ctx.effect(() => ctx.locale.register(LOCALE_NS, 'zh', zh), 'dsh-meta-skills: zh dictionary')

  const t: Translator = ctx.locale.bind(LOCALE_NS)

  // The `main` panel FIRST, so the row below can never select a key that does not
  // exist yet. A ROOT-scope KEYED panel: identity is `key`, and the page receives
  // no session seat.
  ctx.slots.inject('main', () =>
    ctx.slots.register(
      {
        name: 'main',
        key: META_SKILLS_MAIN_KEY,
        locale: LOCALE_NS,
        registrant: 'dsh-meta-skills',
        inject: () => ({ t }),
      },
      MetaSkillsPage as unknown as (props: Record<string, unknown>) => ReactElement | null,
    ),
  )

  // The `sidebar.panellist` row — the fused family's ONE entry. A LIST row, so the
  // identity is `id`, and it must equal the `main` key above or the click throws.
  ctx.slots.inject('sidebar.panellist', () =>
    ctx.slots.register(
      {
        name: 'sidebar.panellist',
        id: META_SKILLS_ROW_ID,
        order: META_SKILLS_ROW_ORDER,
        label: () => t('nav.title'),
        locale: LOCALE_NS,
        registrant: 'dsh-meta-skills',
        inject: () => ({ t }),
      },
      MetaSkillsRowIcon as unknown as (props: Record<string, unknown>) => ReactElement | null,
    ),
  )

  ctx.logger.info(
    `dsh-meta-skills: client active; nav row ${META_SKILLS_ROW_ID}@${META_SKILLS_ROW_ORDER} with keyed main twin ${META_SKILLS_MAIN_KEY}, plus dictionaries`,
  )
}
