window.__ModuleLoader__.load({
	id: "dsh-meta-skills",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/locales.ts
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
		const LOCALE_NS = "dsh-meta-skills";
		/** The label the sidebar row shows. */
		const NAV_LABEL = "Skills & Evolution";
		const en = {
			"nav.title": NAV_LABEL,
			"page.title": NAV_LABEL,
			"page.subtitle": "One surface for the skills / tools evolution family. Five members, one prefix (/meta-skills), one entry. Members stay loaded.",
			"tab.capabilities": "Capabilities",
			"tab.skills": "Skills evolution",
			"tab.gate": "Tools & skills gate",
			"tab.recall": "Recall posture",
			"tab.pipeline": "Evolution pipeline",
			"tab.studio": "Skill studio",
			"caps.total": "capabilities declared",
			"caps.present": "present",
			"caps.unmeasured": "unmeasured",
			"caps.census": "census",
			"caps.family": "Family",
			"caps.id": "Capability",
			"caps.verb": "Verb",
			"caps.path": "Fused path",
			"caps.status": "Status",
			"caps.what": "What it drives",
			"caps.citation": "Member citation",
			"caps.unmeasuredReason": "Why unmeasured",
			"members.title": "Members",
			"members.reachable": "reachable",
			"members.unread": "no reading",
			"members.absent": "absent",
			"members.probe": "Probe",
			"members.status": "Status",
			"excluded.title": "Not absorbed",
			"run.refresh": "Refresh",
			"run.loading": "loading…",
			"run.failed": "request failed",
			"run.empty": "nothing returned",
			"skills.hint": "POST /meta-skills/api/skills/list — the member's own channel, forwarded byte for byte. Reads only.",
			"gate.hint": "GET /meta-skills/api/tools/state — the graded queue, the knobs in force and the ledger census.",
			"pipeline.hint": "GET /meta-skills/api/pipeline/catalog — the mined candidates and their arm/disable state.",
			"recall.hint": "GET /meta-skills/api/recall/status — per-kind recall posture (delivered / absent / blocked). A posture and its reason, never a zero.",
			"studio.hint": "GET /meta-skills/api/studio/state — the catalog the model can actually see (scanned root + plugin snapshot, decomposed), what is staged with its grade, what is promoted and whether the catalog lists it. A source that was NOT READ renders as null with its reason, never as 0.",
			"write.note": "Writes are reachable through the same prefix (POST …/skills/<method>, …/tools/knobs, …/pipeline/arm) but this page wires no destructive button: the members' own consoles remain the place an operator arms or promotes, and nothing here removes them."
		};
		const zh = {
			"nav.title": "技能与演化",
			"page.title": "技能与演化",
			"page.subtitle": "技能／工具演化家族的统一入口：五个成员、一个前缀（/meta-skills）、一个侧边栏条目。成员保持加载。",
			"tab.capabilities": "能力清单",
			"tab.skills": "技能演化",
			"tab.gate": "工具与技能闸门",
			"tab.recall": "召回姿态",
			"tab.pipeline": "演化流水线",
			"tab.studio": "技能工作室",
			"caps.total": "已声明能力",
			"caps.present": "可达",
			"caps.unmeasured": "未测量",
			"caps.census": "统计时刻",
			"caps.family": "家族",
			"caps.id": "能力",
			"caps.verb": "方法",
			"caps.path": "融合路径",
			"caps.status": "状态",
			"caps.what": "驱动什么",
			"caps.citation": "成员出处",
			"caps.unmeasuredReason": "未测量原因",
			"members.title": "成员",
			"members.reachable": "可达",
			"members.unread": "无读数",
			"members.absent": "不存在",
			"members.probe": "探测",
			"members.status": "状态",
			"excluded.title": "未吸收",
			"run.refresh": "刷新",
			"run.loading": "加载中…",
			"run.failed": "请求失败",
			"run.empty": "无返回",
			"skills.hint": "POST /meta-skills/api/skills/list —— 转发到成员自己的通道，逐字节一致。只读。",
			"gate.hint": "GET /meta-skills/api/tools/state —— 已评级队列、生效的旋钮与账本统计。",
			"pipeline.hint": "GET /meta-skills/api/pipeline/catalog —— 挖掘出的候选及其启用／停用状态。",
			"recall.hint": "GET /meta-skills/api/recall/status —— 各类别召回姿态（已交付／缺失／受阻）。只给姿态与原因，不给零。",
			"studio.hint": "GET /meta-skills/api/studio/state —— 模型实际能看到的技能目录（扫描根 + 插件快照，已分解）、暂存候选及其评级、已晋升项以及目录是否列出它们。未读取的来源显示为 null 加原因，绝不显示为 0。",
			"write.note": "写操作同样可从该前缀到达（POST …/skills/<method>、…/tools/knobs、…/pipeline/arm），但本页不提供破坏性按钮：装配或提升仍由各成员自己的控制台完成，本插件不移除它们。"
		};
		//#endregion
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
		/** The ledger route: what the fused surface claims to absorb, with live status. */
		const CAPABILITIES_PATH = "/api/capabilities";
		/** The liveness route: one probe per member, with the probe's own clock. */
		const HEALTH_PATH = "/api/health";
		//#endregion
		//#region src/client/api.ts
		/**
		* dsh-meta-skills — the page's transport.
		*
		* EVERY REQUEST GOES THROUGH THE FUSED PREFIX. The page never calls a member's
		* own route directly: if it did, the fused entry could keep drawing a complete
		* picture while the fused routes were broken, and the parity claim would rest on
		* a path the user never used.
		*
		* A failure is an object, not an exception swallowed into an empty list — the
		* program's own rule. `read()` returns `{ok:false, error}` for a non-2xx or an
		* unparseable body, and the page renders that with the route's name, so "the
		* member refused" and "nothing to show" cannot look the same on screen.
		*
		* @module dsh-meta-skills/client/api
		*/
		/** Bound on one request from the page, in ms. */
		const TIMEOUT_MS = 2e4;
		/** Read one response, refusing to coerce a failure into an empty value. */
		async function read(route, init) {
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
			try {
				const response = await fetch(route, {
					...init,
					signal: controller.signal
				});
				const text = await response.text();
				if (!response.ok) return {
					ok: false,
					error: `HTTP ${response.status}: ${text.slice(0, 400)}`,
					route,
					status: response.status
				};
				try {
					return {
						ok: true,
						value: JSON.parse(text)
					};
				} catch {
					return {
						ok: false,
						error: `body is not JSON (${text.length} chars)`,
						route,
						status: response.status
					};
				}
			} catch (error) {
				return {
					ok: false,
					error: error instanceof Error ? error.message : String(error),
					route,
					status: 0
				};
			} finally {
				clearTimeout(timer);
			}
		}
		/** The capability ledger, priced against the live deployment. */
		async function getCapabilities() {
			return await read(`${ROUTE_PREFIX}${CAPABILITIES_PATH}`, { method: "GET" });
		}
		/** One liveness probe per member. */
		async function getHealth() {
			return await read(`${ROUTE_PREFIX}${HEALTH_PATH}`, { method: "GET" });
		}
		/**
		* Drive one method of the skills channel through the fused prefix.
		*
		* The envelope is the member's own shape (`plugin.mjs:2252-2263`):
		* `{ type: 'client-request', rpcId, method, payload: { args } }`, and the method
		* is ALSO the last path segment, because that is how the member reads it
		* (`plugin.mjs:2163-2176`). Both are sent because the member requires them to
		* agree, and choosing only one would produce a 400 that looks like a wiring bug.
		*/
		async function postSkill(endpoint, args = {}) {
			const rpcId = `meta-skills-${Date.now().toString(36)}`;
			return await read(`${ROUTE_PREFIX}/api/skills/${endpoint}`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					type: "client-request",
					rpcId,
					method: endpoint,
					payload: { args }
				})
			});
		}
		/** Read one route under a fused JSON family (`/api/tools/...`, `/api/recall/...`, `/api/pipeline/...`, `/api/studio/...`). */
		async function getFamily(family, tail) {
			return await read(`${ROUTE_PREFIX}/api/${family}/${tail}`, { method: "GET" });
		}
		//#endregion
		//#region src/client/MetaSkillsPage.tsx
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
		const pageStyle = {
			padding: "18px 22px",
			display: "grid",
			gap: "14px",
			fontSize: "13px",
			lineHeight: 1.45
		};
		const rowStyle = {
			display: "flex",
			gap: "8px",
			flexWrap: "wrap",
			alignItems: "center"
		};
		const tabStyle = {
			padding: "4px 10px",
			borderRadius: "6px",
			border: "1px solid currentColor",
			background: "transparent",
			color: "inherit",
			cursor: "pointer"
		};
		const activeTabStyle = {
			...tabStyle,
			fontWeight: 600,
			background: "color-mix(in srgb, currentColor 12%, transparent)"
		};
		const cardStyle = {
			border: "1px solid color-mix(in srgb, currentColor 30%, transparent)",
			borderRadius: "8px",
			padding: "12px 14px",
			display: "grid",
			gap: "8px"
		};
		const tableStyle = {
			width: "100%",
			borderCollapse: "collapse",
			fontSize: "12px"
		};
		const cellStyle = {
			borderBottom: "1px solid color-mix(in srgb, currentColor 18%, transparent)",
			padding: "4px 6px",
			textAlign: "left",
			verticalAlign: "top"
		};
		const mono = {
			fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
			fontSize: "11.5px"
		};
		const preStyle = {
			...mono,
			maxHeight: "320px",
			overflow: "auto",
			margin: 0,
			padding: "10px",
			border: "1px solid color-mix(in srgb, currentColor 22%, transparent)",
			borderRadius: "6px"
		};
		/** One status chip. An unmeasured row is never rendered as a zero. */
		function Status({ report, t }) {
			const measured = report.status === "present";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				style: {
					...mono,
					fontWeight: 600,
					opacity: measured ? 1 : .75
				},
				title: report.status === "unmeasured" ? report.reason ?? "" : "",
				children: measured ? t("caps.present") : `${t("caps.unmeasured")} — ${report.reason ?? ""}`
			});
		}
		/** The ledger tab. */
		function CapabilitiesTab({ report, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: cardStyle,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: rowStyle,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [
								report.counts.present,
								"/",
								report.counts.total
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("caps.present") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "·" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								report.counts.unmeasured,
								" ",
								t("caps.unmeasured")
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "·" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								style: mono,
								children: [
									t("caps.census"),
									" ",
									report.censusAt
								]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
						style: tableStyle,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								style: cellStyle,
								children: t("caps.family")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								style: cellStyle,
								children: t("caps.id")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								style: cellStyle,
								children: t("caps.verb")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								style: cellStyle,
								children: t("caps.path")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								style: cellStyle,
								children: t("caps.status")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								style: cellStyle,
								children: t("caps.what")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								style: cellStyle,
								children: t("caps.citation")
							})
						] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: report.capabilities.map((capability) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
								style: cellStyle,
								children: capability.family
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
								style: {
									...cellStyle,
									...mono
								},
								children: capability.id
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
								style: cellStyle,
								children: capability.verb
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
								style: {
									...cellStyle,
									...mono
								},
								children: capability.fusedPath ?? "—"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
								style: cellStyle,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Status, {
									report: capability,
									t
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
								style: cellStyle,
								children: capability.what
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
								style: {
									...cellStyle,
									...mono
								},
								children: capability.citation
							})
						] }, capability.id)) })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("excluded.title") }), report.excluded.map((member) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							...mono,
							marginTop: "4px"
						},
						children: [
							member.member,
							" — ",
							member.reason
						]
					}, member.member))] })
				]
			});
		}
		/** The member probe table. */
		function MembersTab({ health, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: cardStyle,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: rowStyle,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [
							health.answered.count,
							"/",
							health.answered.probed
						] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("members.reachable") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							style: mono,
							children: [
								t("caps.census"),
								" ",
								health.censusAt
							]
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
					style: tableStyle,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
							style: cellStyle,
							children: "member"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
							style: cellStyle,
							children: t("members.probe")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
							style: cellStyle,
							children: t("members.status")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
							style: cellStyle,
							children: "why"
						})
					] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: health.members.map((member) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							style: {
								...cellStyle,
								...mono
							},
							children: member.member
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							style: {
								...cellStyle,
								...mono
							},
							children: member.probe
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", {
							style: cellStyle,
							children: [member.reachable === true ? t("members.reachable") : member.reachable === false ? t("members.absent") : t("members.unread"), member.observedStatus === null ? "" : ` (${member.observedStatus})`]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							style: cellStyle,
							children: member.reason ?? ""
						})
					] }, member.member)) })]
				})]
			});
		}
		/** One reading rendered as JSON, or as its refusal. */
		function Result({ reading, t }) {
			if (reading === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				style: mono,
				children: t("run.empty")
			});
			if (!reading.ok) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				style: {
					...mono,
					color: "crimson"
				},
				children: [
					t("run.failed"),
					" — ",
					reading.route,
					": ",
					reading.error
				]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
				style: preStyle,
				children: JSON.stringify(reading.value, null, 1)
			});
		}
		/**
		* Render the fused surface.
		*
		* @param props - the injected translator (see the slot registration in `./index.tsx`).
		* @returns the page element tree.
		*/
		function MetaSkillsPage({ t }) {
			const [tab, setTab] = (0, react.useState)("capabilities");
			const [report, setReport] = (0, react.useState)(null);
			const [health, setHealth] = (0, react.useState)(null);
			const [reading, setReading] = (0, react.useState)(null);
			const [problem, setProblem] = (0, react.useState)(null);
			const loadLedger = (0, react.useCallback)(async () => {
				const [caps, healthReading] = await Promise.all([getCapabilities(), getHealth()]);
				if (caps.ok) setReport(caps.value);
				else setProblem(`${caps.route}: ${caps.error}`);
				if (healthReading.ok) setHealth(healthReading.value);
			}, []);
			(0, react.useEffect)(() => {
				loadLedger();
			}, [loadLedger]);
			const runFamily = (0, react.useCallback)(async (which) => {
				setReading(null);
				setProblem(null);
				if (which === "skills") setReading(await postSkill("list"));
				if (which === "gate") setReading(await getFamily("tools", "state"));
				if (which === "recall") setReading(await getFamily("recall", "status"));
				if (which === "pipeline") setReading(await getFamily("pipeline", "catalog"));
				if (which === "studio") setReading(await getFamily("studio", "state"));
			}, []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: pageStyle,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gap: "4px"
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
							style: {
								margin: 0,
								fontSize: "16px"
							},
							children: t("page.title")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: { opacity: .8 },
							children: t("page.subtitle")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: rowStyle,
						children: [[
							"capabilities",
							"skills",
							"gate",
							"recall",
							"pipeline",
							"studio"
						].map((name) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							style: tab === name ? activeTabStyle : tabStyle,
							onClick: () => {
								setTab(name);
								setReading(null);
							},
							children: t(`tab.${name}`)
						}, name)), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							style: tabStyle,
							onClick: () => {
								loadLedger();
								if (tab !== "capabilities") runFamily(tab);
							},
							children: t("run.refresh")
						})]
					}),
					problem === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							...mono,
							color: "crimson"
						},
						children: problem
					}),
					tab === "capabilities" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gap: "14px"
						},
						children: [report === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: mono,
							children: t("run.loading")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CapabilitiesTab, {
							report,
							t
						}), health === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MembersTab, {
							health,
							t
						})]
					}) : null,
					tab === "skills" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: cardStyle,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: t("skills.hint") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: rowStyle,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									style: tabStyle,
									onClick: () => {
										runFamily("skills");
									},
									children: t("run.refresh")
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Result, {
								reading,
								t
							})
						]
					}) : null,
					tab === "gate" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: cardStyle,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: t("gate.hint") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: rowStyle,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									style: tabStyle,
									onClick: () => {
										runFamily("gate");
									},
									children: t("run.refresh")
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Result, {
								reading,
								t
							})
						]
					}) : null,
					tab === "recall" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: cardStyle,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: t("recall.hint") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: rowStyle,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									style: tabStyle,
									onClick: () => {
										runFamily("recall");
									},
									children: t("run.refresh")
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Result, {
								reading,
								t
							})
						]
					}) : null,
					tab === "pipeline" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: cardStyle,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: t("pipeline.hint") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: rowStyle,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									style: tabStyle,
									onClick: () => {
										runFamily("pipeline");
									},
									children: t("run.refresh")
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Result, {
								reading,
								t
							})
						]
					}) : null,
					tab === "studio" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: cardStyle,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: t("studio.hint") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: rowStyle,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									style: tabStyle,
									onClick: () => {
										runFamily("studio");
									},
									children: t("run.refresh")
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Result, {
								reading,
								t
							})
						]
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							...mono,
							opacity: .75
						},
						children: t("write.note")
					})
				]
			});
		}
		//#endregion
		//#region src/client/index.tsx
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
		/** Loader row name; the client bundle registers itself under this same id. */
		const name = "dsh-meta-skills";
		/** The two Client services this half reads. */
		const inject = ["slots", "locale"];
		/** The `sidebar.panellist` row's `id`. */
		const META_SKILLS_ROW_ID = "dsh-meta-skills:skills";
		/** The `main` panel's `key`. MUST equal {@link META_SKILLS_ROW_ID}. */
		const META_SKILLS_MAIN_KEY = "dsh-meta-skills:skills";
		/**
		* Position among the global panel rows, ascending.
		*
		* Enumerated against the live neighbours rather than picked round: the two rows
		* this fusion speaks for are at **6.3** (`dsh-tools-skills-evolve:evolve`,
		* `src/client/index.tsx:77`) and **6.6** (`dsh-meta-market:market`,
		* `src/client/index.tsx:76`). 6.45 sits between them, addresses no existing cell,
		* and is a fraction rather than an integer so a later lane still has room.
		*/
		const META_SKILLS_ROW_ORDER = 6.45;
		/**
		* The row's glyph: three seeds feeding one stem, drawn inline at the sibling's
		* stroke weight so the row does not look foreign in the sidebar.
		*
		* @returns the svg element.
		*/
		function MetaSkillsRowIcon({ size }) {
			return (0, react.createElement)("svg", {
				width: size ?? 18,
				height: size ?? 18,
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true"
			}, (0, react.createElement)("path", {
				d: "M8 14V7.5",
				stroke: "currentColor",
				strokeWidth: 1.2,
				strokeLinecap: "round"
			}), (0, react.createElement)("path", {
				d: "M8 7.5 3.5 4.5M8 7.5l4.5-3M3.5 4.5v2M12.5 4.5v2",
				stroke: "currentColor",
				strokeWidth: 1.2,
				strokeLinecap: "round"
			}), (0, react.createElement)("circle", {
				cx: 3.5,
				cy: 3.4,
				r: 1.1,
				stroke: "currentColor",
				strokeWidth: 1.1
			}), (0, react.createElement)("circle", {
				cx: 8,
				cy: 2.6,
				r: 1.1,
				stroke: "currentColor",
				strokeWidth: 1.1
			}), (0, react.createElement)("circle", {
				cx: 12.5,
				cy: 3.4,
				r: 1.1,
				stroke: "currentColor",
				strokeWidth: 1.1
			}));
		}
		/**
		* Register the dictionary, the single nav row and the keyed main panel.
		*
		* @param ctx - the Client plugin context (`slots`, `locale`, `effect`, `logger`).
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(LOCALE_NS, "en", en), "dsh-meta-skills: en dictionary");
			ctx.effect(() => ctx.locale.register(LOCALE_NS, "zh", zh), "dsh-meta-skills: zh dictionary");
			const t = ctx.locale.bind(LOCALE_NS);
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: META_SKILLS_MAIN_KEY,
				locale: LOCALE_NS,
				registrant: "dsh-meta-skills",
				inject: () => ({ t })
			}, MetaSkillsPage));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: META_SKILLS_ROW_ID,
				order: META_SKILLS_ROW_ORDER,
				label: () => t("nav.title"),
				locale: LOCALE_NS,
				registrant: "dsh-meta-skills",
				inject: () => ({ t })
			}, MetaSkillsRowIcon));
			ctx.logger.info(`dsh-meta-skills: client active; nav row ${META_SKILLS_ROW_ID}@${META_SKILLS_ROW_ORDER} with keyed main twin ${META_SKILLS_MAIN_KEY}, plus dictionaries`);
		}
		//#endregion
		exports.META_SKILLS_MAIN_KEY = META_SKILLS_MAIN_KEY;
		exports.META_SKILLS_ROW_ID = META_SKILLS_ROW_ID;
		exports.META_SKILLS_ROW_ORDER = META_SKILLS_ROW_ORDER;
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map