/**
 * dsh-meta-skills — the fused page.
 *
 * FIVE TABS, AND THE FIRST ONE IS THE POINT. `Capabilities` shows the ledger the
 * Host half serves: every capability of every absorbed member, its fused path and
 * its status AT THIS REQUEST. A reader can therefore check the fusion claim on the
 * surface itself instead of taking a report's word for it — which is what "the
 * fused surface must not publish a number it cannot derive" means when the reader
 * is the owner rather than a harness.
 *
 * WHAT THIS PAGE DELIBERATELY DOES NOT HAVE: a destructive button. Arming a
 * candidate, setting a gate knob and clearing crystallized skills are all
 * REACHABLE through the prefix this page lives on, and the parity harness drives
 * them; but the operator's consoles remain the members' own, `D-0352` rule 3
 * keeps them loaded, and a fused page that duplicated their write buttons would
 * be the second implementation of them that drifts.
 *
 * @module dsh-meta-skills/client/MetaSkillsPage
 */

import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { CapabilitiesResponse, CapabilityReport, HealthResponse } from '../shared/protocol.ts'
import { getCapabilities, getFamily, getHealth, postSkill, type Reading } from './api.ts'
import type { Translator } from './types.ts'

/** The tabs this page offers. */
type Tab = 'capabilities' | 'skills' | 'gate' | 'recall' | 'pipeline' | 'studio'

const pageStyle: CSSProperties = { padding: '18px 22px', display: 'grid', gap: '14px', fontSize: '13px', lineHeight: 1.45 }
const rowStyle: CSSProperties = { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }
const tabStyle: CSSProperties = { padding: '4px 10px', borderRadius: '6px', border: '1px solid currentColor', background: 'transparent', color: 'inherit', cursor: 'pointer' }
const activeTabStyle: CSSProperties = { ...tabStyle, fontWeight: 600, background: 'color-mix(in srgb, currentColor 12%, transparent)' }
const cardStyle: CSSProperties = { border: '1px solid color-mix(in srgb, currentColor 30%, transparent)', borderRadius: '8px', padding: '12px 14px', display: 'grid', gap: '8px' }
const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '12px' }
const cellStyle: CSSProperties = { borderBottom: '1px solid color-mix(in srgb, currentColor 18%, transparent)', padding: '4px 6px', textAlign: 'left', verticalAlign: 'top' }
const mono: CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '11.5px' }
const preStyle: CSSProperties = { ...mono, maxHeight: '320px', overflow: 'auto', margin: 0, padding: '10px', border: '1px solid color-mix(in srgb, currentColor 22%, transparent)', borderRadius: '6px' }

/** One status chip. An unmeasured row is never rendered as a zero. */
function Status({ report, t }: { report: CapabilityReport; t: Translator }) {
  const measured = report.status === 'present'
  return (
    <span style={{ ...mono, fontWeight: 600, opacity: measured ? 1 : 0.75 }} title={report.status === 'unmeasured' ? (report.reason ?? '') : ''}>
      {measured ? t('caps.present') : `${t('caps.unmeasured')} — ${report.reason ?? ''}`}
    </span>
  )
}

/** The ledger tab. */
function CapabilitiesTab({ report, t }: { report: CapabilitiesResponse; t: Translator }) {
  return (
    <div style={cardStyle}>
      <div style={rowStyle}>
        <strong>{report.counts.present}/{report.counts.total}</strong>
        <span>{t('caps.present')}</span>
        <span>·</span>
        <span>{report.counts.unmeasured} {t('caps.unmeasured')}</span>
        <span>·</span>
        <span style={mono}>{t('caps.census')} {report.censusAt}</span>
      </div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={cellStyle}>{t('caps.family')}</th>
            <th style={cellStyle}>{t('caps.id')}</th>
            <th style={cellStyle}>{t('caps.verb')}</th>
            <th style={cellStyle}>{t('caps.path')}</th>
            <th style={cellStyle}>{t('caps.status')}</th>
            <th style={cellStyle}>{t('caps.what')}</th>
            <th style={cellStyle}>{t('caps.citation')}</th>
          </tr>
        </thead>
        <tbody>
          {report.capabilities.map(capability => (
            <tr key={capability.id}>
              <td style={cellStyle}>{capability.family}</td>
              <td style={{ ...cellStyle, ...mono }}>{capability.id}</td>
              <td style={cellStyle}>{capability.verb}</td>
              <td style={{ ...cellStyle, ...mono }}>{capability.fusedPath ?? '—'}</td>
              <td style={cellStyle}><Status report={capability} t={t} /></td>
              <td style={cellStyle}>{capability.what}</td>
              <td style={{ ...cellStyle, ...mono }}>{capability.citation}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <strong>{t('excluded.title')}</strong>
        {report.excluded.map(member => (
          <div key={member.member} style={{ ...mono, marginTop: '4px' }}>
            {member.member} — {member.reason}
          </div>
        ))}
      </div>
    </div>
  )
}

/** The member probe table. */
function MembersTab({ health, t }: { health: HealthResponse; t: Translator }) {
  return (
    <div style={cardStyle}>
      <div style={rowStyle}>
        <strong>{health.answered.count}/{health.answered.probed}</strong>
        <span>{t('members.reachable')}</span>
        <span style={mono}>{t('caps.census')} {health.censusAt}</span>
      </div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={cellStyle}>member</th>
            <th style={cellStyle}>{t('members.probe')}</th>
            <th style={cellStyle}>{t('members.status')}</th>
            <th style={cellStyle}>why</th>
          </tr>
        </thead>
        <tbody>
          {health.members.map(member => (
            <tr key={member.member}>
              <td style={{ ...cellStyle, ...mono }}>{member.member}</td>
              <td style={{ ...cellStyle, ...mono }}>{member.probe}</td>
              <td style={cellStyle}>
                {member.reachable === true ? t('members.reachable') : member.reachable === false ? t('members.absent') : t('members.unread')}
                {member.observedStatus === null ? '' : ` (${member.observedStatus})`}
              </td>
              <td style={cellStyle}>{member.reason ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** One reading rendered as JSON, or as its refusal. */
function Result({ reading, t }: { reading: Reading<unknown> | null; t: Translator }) {
  if (reading === null) return <span style={mono}>{t('run.empty')}</span>
  if (!reading.ok) return <span style={{ ...mono, color: 'crimson' }}>{t('run.failed')} — {reading.route}: {reading.error}</span>
  return <pre style={preStyle}>{JSON.stringify(reading.value, null, 1)}</pre>
}

/**
 * Render the fused surface.
 *
 * @param props - the injected translator (see the slot registration in `./index.tsx`).
 * @returns the page element tree.
 */
export function MetaSkillsPage({ t }: { t: Translator }): React.ReactElement {
  const [tab, setTab] = useState<Tab>('capabilities')
  const [report, setReport] = useState<CapabilitiesResponse | null>(null)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [reading, setReading] = useState<Reading<unknown> | null>(null)
  const [problem, setProblem] = useState<string | null>(null)

  const loadLedger = useCallback(async () => {
    const [caps, healthReading] = await Promise.all([getCapabilities(), getHealth()])
    if (caps.ok) setReport(caps.value)
    else setProblem(`${caps.route}: ${caps.error}`)
    if (healthReading.ok) setHealth(healthReading.value)
  }, [])

  useEffect(() => {
    void loadLedger()
  }, [loadLedger])

  const runFamily = useCallback(async (which: Tab) => {
    setReading(null)
    setProblem(null)
    if (which === 'skills') setReading(await postSkill('list'))
    if (which === 'gate') setReading(await getFamily('tools', 'state'))
    if (which === 'recall') setReading(await getFamily('recall', 'status'))
    if (which === 'pipeline') setReading(await getFamily('pipeline', 'catalog'))
    if (which === 'studio') setReading(await getFamily('studio', 'state'))
  }, [])

  return (
    <div style={pageStyle}>
      <div style={{ display: 'grid', gap: '4px' }}>
        <h2 style={{ margin: 0, fontSize: '16px' }}>{t('page.title')}</h2>
        <div style={{ opacity: 0.8 }}>{t('page.subtitle')}</div>
      </div>

      <div style={rowStyle}>
        {(['capabilities', 'skills', 'gate', 'recall', 'pipeline', 'studio'] as const).map(name => (
          <button key={name} type="button" style={tab === name ? activeTabStyle : tabStyle} onClick={() => { setTab(name); setReading(null) }}>
            {t(`tab.${name}`)}
          </button>
        ))}
        <button type="button" style={tabStyle} onClick={() => { void loadLedger(); if (tab !== 'capabilities') void runFamily(tab) }}>{t('run.refresh')}</button>
      </div>

      {problem === null ? null : <div style={{ ...mono, color: 'crimson' }}>{problem}</div>}

      {tab === 'capabilities' ? (
        <div style={{ display: 'grid', gap: '14px' }}>
          {report === null ? <span style={mono}>{t('run.loading')}</span> : <CapabilitiesTab report={report} t={t} />}
          {health === null ? null : <MembersTab health={health} t={t} />}
        </div>
      ) : null}

      {tab === 'skills' ? (
        <div style={cardStyle}>
          <div>{t('skills.hint')}</div>
          <div style={rowStyle}><button type="button" style={tabStyle} onClick={() => { void runFamily('skills') }}>{t('run.refresh')}</button></div>
          <Result reading={reading} t={t} />
        </div>
      ) : null}

      {tab === 'gate' ? (
        <div style={cardStyle}>
          <div>{t('gate.hint')}</div>
          <div style={rowStyle}><button type="button" style={tabStyle} onClick={() => { void runFamily('gate') }}>{t('run.refresh')}</button></div>
          <Result reading={reading} t={t} />
        </div>
      ) : null}

      {tab === 'recall' ? (
        <div style={cardStyle}>
          <div>{t('recall.hint')}</div>
          <div style={rowStyle}><button type="button" style={tabStyle} onClick={() => { void runFamily('recall') }}>{t('run.refresh')}</button></div>
          <Result reading={reading} t={t} />
        </div>
      ) : null}

      {tab === 'pipeline' ? (
        <div style={cardStyle}>
          <div>{t('pipeline.hint')}</div>
          <div style={rowStyle}><button type="button" style={tabStyle} onClick={() => { void runFamily('pipeline') }}>{t('run.refresh')}</button></div>
          <Result reading={reading} t={t} />
        </div>
      ) : null}

      {tab === 'studio' ? (
        <div style={cardStyle}>
          <div>{t('studio.hint')}</div>
          <div style={rowStyle}><button type="button" style={tabStyle} onClick={() => { void runFamily('studio') }}>{t('run.refresh')}</button></div>
          <Result reading={reading} t={t} />
        </div>
      ) : null}

      <div style={{ ...mono, opacity: 0.75 }}>{t('write.note')}</div>
    </div>
  )
}
