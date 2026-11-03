/**
 * dsh-meta-skills — the dictionaries.
 *
 * One namespace, two languages, flat keys. The page is the ONLY place this
 * plugin's words appear: the fused routes return the members' own payloads
 * verbatim and this file translates none of them, because re-labelling a
 * member's field here is how two vocabularies for one fact start.
 *
 * @module dsh-meta-skills/client/locales
 */

/** The locale namespace; also the row's locale binding. */
export const LOCALE_NS = 'dsh-meta-skills'

/** The label the sidebar row shows. */
export const NAV_LABEL = 'Skills & Evolution'

export const en: Record<string, string> = {
  'nav.title': NAV_LABEL,
  'page.title': NAV_LABEL,
  'page.subtitle': 'One surface for the skills / tools evolution family. Five members, one prefix (/meta-skills), one entry. Members stay loaded.',
  'tab.capabilities': 'Capabilities',
  'tab.skills': 'Skills evolution',
  'tab.gate': 'Tools & skills gate',
  'tab.recall': 'Recall posture',
  'tab.pipeline': 'Evolution pipeline',
  'tab.studio': 'Skill studio',
  'caps.total': 'capabilities declared',
  'caps.present': 'present',
  'caps.unmeasured': 'unmeasured',
  'caps.census': 'census',
  'caps.family': 'Family',
  'caps.id': 'Capability',
  'caps.verb': 'Verb',
  'caps.path': 'Fused path',
  'caps.status': 'Status',
  'caps.what': 'What it drives',
  'caps.citation': 'Member citation',
  'caps.unmeasuredReason': 'Why unmeasured',
  'members.title': 'Members',
  'members.reachable': 'reachable',
  'members.unread': 'no reading',
  'members.absent': 'absent',
  'members.probe': 'Probe',
  'members.status': 'Status',
  'excluded.title': 'Not absorbed',
  'run.refresh': 'Refresh',
  'run.loading': 'loading…',
  'run.failed': 'request failed',
  'run.empty': 'nothing returned',
  'skills.hint': 'POST /meta-skills/api/skills/list — the member\'s own channel, forwarded byte for byte. Reads only.',
  'gate.hint': 'GET /meta-skills/api/tools/state — the graded queue, the knobs in force and the ledger census.',
  'pipeline.hint': 'GET /meta-skills/api/pipeline/catalog — the mined candidates and their arm/disable state.',
  'recall.hint': 'GET /meta-skills/api/recall/status — per-kind recall posture (delivered / absent / blocked). A posture and its reason, never a zero.',
  'studio.hint': 'GET /meta-skills/api/studio/state — the catalog the model can actually see (scanned root + plugin snapshot, decomposed), what is staged with its grade, what is promoted and whether the catalog lists it. A source that was NOT READ renders as null with its reason, never as 0.',
  'write.note': 'Writes are reachable through the same prefix (POST …/skills/<method>, …/tools/knobs, …/pipeline/arm) but this page wires no destructive button: the members\' own consoles remain the place an operator arms or promotes, and nothing here removes them.',
}

export const zh: Record<string, string> = {
  'nav.title': '技能与演化',
  'page.title': '技能与演化',
  'page.subtitle': '技能／工具演化家族的统一入口：五个成员、一个前缀（/meta-skills）、一个侧边栏条目。成员保持加载。',
  'tab.capabilities': '能力清单',
  'tab.skills': '技能演化',
  'tab.gate': '工具与技能闸门',
  'tab.recall': '召回姿态',
  'tab.pipeline': '演化流水线',
  'tab.studio': '技能工作室',
  'caps.total': '已声明能力',
  'caps.present': '可达',
  'caps.unmeasured': '未测量',
  'caps.census': '统计时刻',
  'caps.family': '家族',
  'caps.id': '能力',
  'caps.verb': '方法',
  'caps.path': '融合路径',
  'caps.status': '状态',
  'caps.what': '驱动什么',
  'caps.citation': '成员出处',
  'caps.unmeasuredReason': '未测量原因',
  'members.title': '成员',
  'members.reachable': '可达',
  'members.unread': '无读数',
  'members.absent': '不存在',
  'members.probe': '探测',
  'members.status': '状态',
  'excluded.title': '未吸收',
  'run.refresh': '刷新',
  'run.loading': '加载中…',
  'run.failed': '请求失败',
  'run.empty': '无返回',
  'skills.hint': 'POST /meta-skills/api/skills/list —— 转发到成员自己的通道，逐字节一致。只读。',
  'gate.hint': 'GET /meta-skills/api/tools/state —— 已评级队列、生效的旋钮与账本统计。',
  'pipeline.hint': 'GET /meta-skills/api/pipeline/catalog —— 挖掘出的候选及其启用／停用状态。',
  'recall.hint': 'GET /meta-skills/api/recall/status —— 各类别召回姿态（已交付／缺失／受阻）。只给姿态与原因，不给零。',
  'studio.hint': 'GET /meta-skills/api/studio/state —— 模型实际能看到的技能目录（扫描根 + 插件快照，已分解）、暂存候选及其评级、已晋升项以及目录是否列出它们。未读取的来源显示为 null 加原因，绝不显示为 0。',
  'write.note': '写操作同样可从该前缀到达（POST …/skills/<method>、…/tools/knobs、…/pipeline/arm），但本页不提供破坏性按钮：装配或提升仍由各成员自己的控制台完成，本插件不移除它们。',
}
