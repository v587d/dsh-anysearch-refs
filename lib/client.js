window.__ModuleLoader__.load({
	id: "dsh-anysearch-refs",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:/home/shawn/projects/dsh-anysearch-refs/src/client/styles.module.css.mjs
		const css = ".gOvgwW_container{height:100%;min-height:0;font:var(--dsw-font-xs-13,13px/1.5 -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);color:var(--dsw-alias-label-primary,#1e1e2e);flex-direction:column;display:flex;position:relative;overflow:hidden}.gOvgwW_header{border-bottom:1px solid var(--dsw-alias-border-l1,#e0e0e0);background:var(--dsw-alias-bg-layer-1,#f8f8f8);flex-shrink:0;justify-content:space-between;align-items:center;padding:10px 14px;display:flex}.gOvgwW_headerTitle{font:var(--dsw-font-xs-strong-13,600 14px/1.4 -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);color:var(--dsw-alias-label-primary,#1e1e2e)}.gOvgwW_headerCount{font:var(--dsw-font-xxxs-11,12px/1.4 -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);color:var(--dsw-alias-label-secondary,#666)}.gOvgwW_scrollArea{flex-direction:column;flex:1;gap:10px;min-height:0;padding:10px;display:flex;overflow-y:auto}.gOvgwW_empty{text-align:center;flex-direction:column;justify-content:center;align-items:center;gap:8px;height:100%;min-height:0;padding:32px 16px;display:flex}.gOvgwW_emptyIcon{opacity:.5;font-size:36px}.gOvgwW_emptyTitle{color:var(--dsw-alias-label-primary,#1e1e2e);font-size:14px;font-weight:600}.gOvgwW_emptyHint{color:var(--dsw-alias-label-tertiary,#888);max-width:240px;font-size:12px;line-height:1.5}.gOvgwW_batchCard{border:1px solid var(--dsw-alias-border-l1,#e0e0e0);background:var(--dsw-alias-bg-layer-2,#fff);border-radius:10px;flex:none;overflow:hidden}.gOvgwW_batchHeader{background:var(--dsw-alias-bg-layer-1,#fafafa);border-bottom:1px solid var(--dsw-alias-border-l1,#e0e0e0);justify-content:space-between;align-items:flex-start;gap:10px;padding:8px 12px;display:flex}.gOvgwW_batchHeaderLeft{flex-wrap:wrap;flex:1;align-items:baseline;gap:6px;min-width:0;display:flex}.gOvgwW_batchQuery{font:var(--dsw-font-xs-strong-13,600 13px/1.4 -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);color:var(--dsw-alias-label-primary,#1e1e2e);word-break:break-word;overflow-wrap:anywhere}.gOvgwW_batchMeta{font:var(--dsw-font-xxxs-11,11px/1.4 -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);color:var(--dsw-alias-label-secondary,#666)}.gOvgwW_batchTime{font:var(--dsw-font-xxxs-11,11px/1.4 -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);color:var(--dsw-alias-label-tertiary,#888);flex:none}.gOvgwW_sourcesList{padding:4px 0}.gOvgwW_sourceCard{border-bottom:1px solid var(--dsw-alias-border-l1,#e0e0e0);align-items:flex-start;gap:10px;padding:10px 12px;transition:background .15s;display:flex}.gOvgwW_sourceCard:last-child{border-bottom:none}.gOvgwW_sourceCard:hover{background:var(--dsw-alias-interactive-bg-hover,#f0f4ff)}.gOvgwW_previewButton{border:1px solid var(--dsw-alias-border-l1,#e0e0e0);background:var(--dsw-alias-bg-layer-1,#f8f8f8);width:28px;height:28px;color:var(--dsw-alias-label-secondary,#666);cursor:pointer;border-radius:8px;flex:none;justify-content:center;align-items:center;padding:0;transition:background .15s,color .15s,border-color .15s;display:inline-flex}.gOvgwW_previewButton:hover{background:var(--dsw-alias-interactive-bg-hover,#eef2ff);color:var(--dsw-alias-brand-primary,#2563eb);border-color:var(--dsw-alias-border-l2,silver)}.gOvgwW_sourceBody{flex:1;min-width:0}.gOvgwW_sourceTitle{font:var(--dsw-font-xs-strong-13,600 13px/1.4 -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);color:var(--dsw-alias-label-primary,#1e1e2e);word-break:break-word;overflow-wrap:anywhere;text-decoration:none;display:block}.gOvgwW_sourceTitle:hover{color:var(--dsw-alias-brand-primary,#2563eb);text-decoration:underline}.gOvgwW_sourceUrlLine{text-overflow:ellipsis;white-space:nowrap;margin-top:2px;overflow:hidden}.gOvgwW_sourceUrl{font:var(--dsw-font-xxxs-11,11px/1.4 -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);color:var(--dsw-alias-label-secondary,#666);text-decoration:none}.gOvgwW_sourceUrl:hover{color:var(--dsw-alias-brand-primary,#2563eb);text-decoration:underline}.gOvgwW_sourceSnippet{font:var(--dsw-font-xxs-12,12px/1.45 -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);color:var(--dsw-alias-label-secondary,#444);-webkit-line-clamp:3;-webkit-box-orient:vertical;margin-top:5px;display:-webkit-box;overflow:hidden}.gOvgwW_highlight{color:#1e1e2e;background:#ffeb3b;border-radius:3px;padding:0 2px;font-weight:600}.gOvgwW_sourceOpen{width:24px;height:24px;color:var(--dsw-alias-label-tertiary,#888);border-radius:6px;flex:none;justify-content:center;align-items:center;text-decoration:none;transition:background .15s,color .15s;display:inline-flex}.gOvgwW_sourceOpen:hover{background:var(--dsw-alias-interactive-bg-hover,#eef2ff);color:var(--dsw-alias-brand-primary,#2563eb)}.gOvgwW_previewOverlay{z-index:10;background:var(--dsw-alias-bg-layer-1,#fff);flex-direction:column;display:flex;position:absolute;inset:0}.gOvgwW_previewHeader{border-bottom:1px solid var(--dsw-alias-border-l1,#e0e0e0);background:var(--dsw-alias-bg-layer-2,#f8f8f8);flex-shrink:0;justify-content:space-between;align-items:center;gap:10px;padding:8px 12px;display:flex}.gOvgwW_previewTitle{text-overflow:ellipsis;white-space:nowrap;min-width:0;font:var(--dsw-font-xs-strong-13,600 13px/1.4 -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);color:var(--dsw-alias-label-primary,#1e1e2e);flex:1;overflow:hidden}.gOvgwW_previewClose{width:26px;height:26px;color:var(--dsw-alias-label-secondary,#666);cursor:pointer;background:0 0;border:none;border-radius:6px;flex:none;justify-content:center;align-items:center;padding:0;font-size:18px;line-height:1;display:inline-flex}.gOvgwW_previewClose:hover{background:var(--dsw-alias-interactive-bg-hover,#eef2ff);color:var(--dsw-alias-label-primary,#1e1e2e)}.gOvgwW_previewFrame{background:var(--dsw-alias-bg-base,#fff);border:none;flex:1;width:100%;min-height:0}";
		const tagId = "dsh-anysearch-refs/styles.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-anysearch-refs";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var styles_module_css_default = {
			"sourceBody": "gOvgwW_sourceBody",
			"batchQuery": "gOvgwW_batchQuery",
			"batchHeader": "gOvgwW_batchHeader",
			"previewOverlay": "gOvgwW_previewOverlay",
			"batchMeta": "gOvgwW_batchMeta",
			"previewTitle": "gOvgwW_previewTitle",
			"header": "gOvgwW_header",
			"previewHeader": "gOvgwW_previewHeader",
			"sourceTitle": "gOvgwW_sourceTitle",
			"sourceSnippet": "gOvgwW_sourceSnippet",
			"scrollArea": "gOvgwW_scrollArea",
			"container": "gOvgwW_container",
			"emptyTitle": "gOvgwW_emptyTitle",
			"headerCount": "gOvgwW_headerCount",
			"batchHeaderLeft": "gOvgwW_batchHeaderLeft",
			"sourceUrl": "gOvgwW_sourceUrl",
			"batchCard": "gOvgwW_batchCard",
			"headerTitle": "gOvgwW_headerTitle",
			"previewClose": "gOvgwW_previewClose",
			"empty": "gOvgwW_empty",
			"emptyIcon": "gOvgwW_emptyIcon",
			"previewFrame": "gOvgwW_previewFrame",
			"highlight": "gOvgwW_highlight",
			"batchTime": "gOvgwW_batchTime",
			"previewButton": "gOvgwW_previewButton",
			"emptyHint": "gOvgwW_emptyHint",
			"sourcesList": "gOvgwW_sourcesList",
			"sourceOpen": "gOvgwW_sourceOpen",
			"sourceCard": "gOvgwW_sourceCard",
			"sourceUrlLine": "gOvgwW_sourceUrlLine"
		};
		//#endregion
		//#region src/client/index.tsx
		const TAB_ID = "anysearch-refs:anysearch-refs";
		/** Content seed used to auto-expand the right panel when opening. */
		const AUTO_OPEN_SEED_PATH = "anysearch://refs";
		const inject = ["betterSidebar"];
		async function fetchResults(sessionId, signal, wait = false) {
			const res = await fetch("/api/refs/anysearch", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					sessionId,
					wait,
					timeoutMs: 3e4
				}),
				signal
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const parsed = await res.json();
			if (!parsed?.ok || !parsed?.value) throw new Error("unexpected response shape");
			return parsed.value;
		}
		function safeHostname(url) {
			try {
				return new URL(url).hostname;
			} catch {
				return url;
			}
		}
		function totalSources(batches) {
			return batches.reduce((sum, b) => sum + b.sources.length, 0);
		}
		function formatTimeAgo(ts) {
			const diffMs = Date.now() - ts;
			const diffSec = Math.floor(diffMs / 1e3);
			if (diffSec < 60) return `${diffSec}s ago`;
			const diffMin = Math.floor(diffSec / 60);
			if (diffMin < 60) return `${diffMin}m ago`;
			const diffHr = Math.floor(diffMin / 60);
			if (diffHr < 24) return `${diffHr}h ago`;
			return new Date(ts).toLocaleDateString();
		}
		function batchSignature(batch) {
			return JSON.stringify([
				batch.requestId ?? "",
				batch.timestamp ?? 0,
				batch.query ?? "",
				batch.payload ?? null,
				...batch.sources.map((s) => `${s.title}|${s.url}|${s.snippet ?? ""}`)
			]);
		}
		function resultsSignature(batches) {
			return batches.slice(0, 10).map(batchSignature).join("\n");
		}
		/** Case-insensitive literal highlight; only used in snippets, never titles. */
		function highlightSnippet(text, query) {
			if (!query || !text) return [text];
			const lowerText = text.toLowerCase();
			const lowerQuery = query.toLowerCase();
			if (!lowerQuery) return [text];
			const parts = [];
			let index = 0;
			let start = lowerText.indexOf(lowerQuery);
			let key = 0;
			while (start !== -1) {
				if (start > index) parts.push(text.slice(index, start));
				parts.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("mark", {
					className: styles_module_css_default.highlight,
					children: text.slice(start, start + query.length)
				}, key++));
				index = start + query.length;
				start = lowerText.indexOf(lowerQuery, index);
			}
			if (index < text.length) parts.push(text.slice(index));
			return parts;
		}
		/** Return the id of the first leaf in the right split tree. */
		function firstRightLeafId(state) {
			let node = state.splits;
			while (node && node.kind !== "leaf") {
				const children = node.children;
				node = Array.isArray(children) ? children[0] : void 0;
			}
			return node?.id ?? "";
		}
		/** Return the right-pane leaf that already hosts AnySearch Refs, if any. */
		function rightLeafForRefs(state) {
			const walk = (node) => {
				if (!node) return void 0;
				if (node.kind === "leaf") return Array.isArray(node.tabs) && node.tabs.some((tab) => tab.type === TAB_ID) ? node.id : void 0;
				for (const child of node.children ?? []) {
					const found = walk(child);
					if (found !== void 0) return found;
				}
			};
			return walk(state.splits) ?? firstRightLeafId(state);
		}
		function AnySearchRefsTab(props) {
			const { scope, visible } = props;
			const [batches, setBatches] = useState([]);
			const controllerRef = useRef(void 0);
			useEffect(() => {
				if (!visible) {
					controllerRef.current?.abort();
					return;
				}
				const ctrl = new AbortController();
				controllerRef.current = ctrl;
				let cancelled = false;
				const loop = async () => {
					let first = true;
					while (!cancelled) try {
						const data = await fetchResults(scope.sessionId, ctrl.signal, !first);
						if (cancelled) return;
						setBatches(data.batches ?? []);
						first = false;
					} catch (err) {
						if (ctrl.signal.aborted || cancelled) return;
						const msg = err instanceof Error ? err.message : String(err);
						console.warn(`[dsh-anysearch-refs] fetch failed: ${msg}`);
						await new Promise((r) => setTimeout(r, 2e3));
					}
				};
				loop();
				return () => {
					cancelled = true;
					ctrl.abort();
				};
			}, [scope.sessionId, visible]);
			if (batches.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: styles_module_css_default.empty,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: styles_module_css_default.emptyIcon,
						children: "🔍"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: styles_module_css_default.emptyTitle,
						children: "AnySearch Refs"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: styles_module_css_default.emptyHint,
						children: "Search results will appear here when the assistant uses AnySearch."
					})
				]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: styles_module_css_default.container,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: styles_module_css_default.header,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: styles_module_css_default.headerTitle,
						children: "All references"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: styles_module_css_default.headerCount,
						children: [totalSources(batches), " sources"]
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: styles_module_css_default.scrollArea,
					children: batches.map((batch, bi) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SearchBatchCard, { batch }, bi))
				})]
			});
		}
		function SearchBatchCard(props) {
			const { batch } = props;
			const timeAgo = formatTimeAgo(batch.timestamp);
			const query = batch.query ?? (typeof batch.payload?.query === "string" ? batch.payload.query : void 0);
			const meta = [
				batch.totalResults !== void 0 ? `${batch.totalResults} results` : null,
				batch.searchTimeMs !== void 0 ? `${batch.searchTimeMs}ms` : null,
				batch.requestId ? `Req: ${batch.requestId.slice(0, 8)}…` : null
			].filter(Boolean);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: styles_module_css_default.batchCard,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: styles_module_css_default.batchHeader,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: styles_module_css_default.batchHeaderLeft,
						children: [query && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: styles_module_css_default.batchQuery,
							title: query,
							children: ["🔍 ", query]
						}), meta.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: styles_module_css_default.batchMeta,
							children: meta.join(" · ")
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: styles_module_css_default.batchTime,
						children: timeAgo
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: styles_module_css_default.sourcesList,
					children: batch.sources.map((source, si) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SourceCard, {
						source,
						query
					}, si))
				})]
			});
		}
		function SourceCard(props) {
			const { source, query } = props;
			const hostname = safeHostname(source.url);
			const label = source.title || hostname;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: styles_module_css_default.sourceCard,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: styles_module_css_default.sourceBody,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
							className: styles_module_css_default.sourceTitle,
							href: source.url,
							target: "_blank",
							rel: "noopener noreferrer",
							title: source.url,
							children: label
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: styles_module_css_default.sourceUrlLine,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								className: styles_module_css_default.sourceUrl,
								href: source.url,
								target: "_blank",
								rel: "noopener noreferrer",
								title: source.url,
								children: hostname
							})
						}),
						source.snippet && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: styles_module_css_default.sourceSnippet,
							children: highlightSnippet(source.snippet, query)
						})
					]
				})
			});
		}
		const { useState, useEffect, useCallback, useRef } = require("react");
		/**
		* Client plugin entry point (called by the DSH client runtime).
		* @param ctx - the client cordis context.
		*/
		function apply(ctx) {
			if (!ctx.betterSidebar) {
				console.warn(`[dsh-anysearch-refs] dsh-better-sidebar not available; skipping tab registration`);
				return;
			}
			ctx.effect(() => ctx.betterSidebar.registerTab({
				id: TAB_ID,
				title: "AnySearch Refs",
				icon: (size) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutline16, { size }),
				order: 60,
				single: true,
				createTab: (state) => ({
					tab: {
						id: TAB_ID,
						type: TAB_ID,
						title: "AnySearch Refs"
					},
					patch: { activePane: rightLeafForRefs(state) }
				}),
				component: (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AnySearchRefsTab, { ...props })
			}));
			ctx.effect(() => {
				const service = ctx.betterSidebar;
				if (!service || typeof service.getSnapshot !== "function" || typeof service.openTab !== "function") return;
				const seen = /* @__PURE__ */ new Map();
				let disposed = false;
				let controller;
				const loop = async () => {
					let first = true;
					while (!disposed) {
						const sessionId = service.getSnapshot()?.sessionId;
						if (!sessionId || service.isTabEnabled?.(TAB_ID) === false) {
							await new Promise((r) => setTimeout(r, 1e3));
							continue;
						}
						controller?.abort();
						const ctrl = new AbortController();
						controller = ctrl;
						try {
							const data = await fetchResults(sessionId, ctrl.signal, !first);
							if (disposed || ctrl.signal.aborted) return;
							if (service.getSnapshot()?.sessionId !== sessionId) {
								first = true;
								continue;
							}
							const signature = resultsSignature(data.batches ?? []);
							const previous = seen.get(sessionId);
							if (signature.length > 0 && signature !== previous) service.openTab({
								type: TAB_ID,
								title: "AnySearch Refs",
								path: AUTO_OPEN_SEED_PATH
							}, { sessionId });
							seen.set(sessionId, signature);
							first = false;
						} catch (err) {
							if (ctrl.signal.aborted || disposed) return;
							console.warn(`[dsh-anysearch-refs] auto-open poll failed: ${err instanceof Error ? err.message : String(err)}`);
							await new Promise((r) => setTimeout(r, 2e3));
						}
					}
				};
				loop();
				return () => {
					disposed = true;
					controller?.abort();
				};
			}, "dsh-anysearch-refs: auto-open watcher");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map