//#region src/shared/parser.ts
/** Meta line: "AnySearch returned 3 result(s) in 2359 ms." */
const META_RE = /AnySearch returned (\d+) result\(s\) in (\d+) ms\./;
/** Request ID line: "Request ID: 44e2f296-9f20-4a76-80ca-0ff8f53b2b03" */
const REQUEST_ID_RE = /Request ID: ([\w-]+)/;
/** Source line: "- [Title](URL) — Snippet" (snippet optional).
*  Non-greedy (.+?) for title; URL uses https?:\/\/ + non-greedy up to
*  the closing paren that is followed by " — " or end-of-line, so
*  parenthesised URLs like Wikipedia paths are handled by backtracking.
*/
const SOURCE_RE = /^- \[(.+?)\]\((https?:\/\/.+?)\)(?: — (.+))?$/gm;
/** Batch section header: "## 1. query text" */
const BATCH_SECTION_RE = /^## (\d+)\.\s+(.+)$/gm;
/** Parse rendered text into one or more batches.
*  For anysearch_search the text contains one Sources block → one batch.
*  For anysearch_batch_search the text contains N "## N." sections,
*  each with its own Sources block → N batches.
*/
function parseAnySearchRenderedText(text) {
	if (text.length === 0) return [];
	return splitSections(text).map((section) => parseSingleSection(section.text, section.query, section.order));
}
/** Parse a single section (one anysearch_search result or one batch item). */
function parseSingleSection(text, query, order) {
	const batch = {
		timestamp: Date.now(),
		...query !== void 0 ? { query } : {},
		...order !== void 0 ? { order } : {},
		sources: []
	};
	const metaMatch = META_RE.exec(text);
	if (metaMatch) {
		batch.totalResults = parseInt(metaMatch[1], 10);
		batch.searchTimeMs = parseInt(metaMatch[2], 10);
	}
	const reqIdMatch = REQUEST_ID_RE.exec(text);
	if (reqIdMatch) batch.requestId = reqIdMatch[1];
	const sources = [];
	SOURCE_RE.lastIndex = 0;
	let m;
	while ((m = SOURCE_RE.exec(text)) !== null) sources.push({
		title: m[1].trim(),
		url: m[2].trim(),
		snippet: m[3] ? m[3].trim() : void 0
	});
	batch.sources = sources;
	return batch;
}
/** Split rendered text on "## N." section headers.
*  Returns an array of sections: [before-first-header?, ...sections].
*  If no headers found, returns [text] (single batch).
*/
function splitSections(text) {
	const headers = [];
	let m;
	BATCH_SECTION_RE.lastIndex = 0;
	while ((m = BATCH_SECTION_RE.exec(text)) !== null) headers.push({
		index: m.index,
		order: parseInt(m[1], 10),
		text: m[2]
	});
	if (headers.length === 0) return [{
		text,
		query: void 0,
		order: void 0
	}];
	const sections = [];
	for (let i = 0; i < headers.length; i++) {
		const start = headers[i].index;
		const end = i < headers.length - 1 ? headers[i + 1].index : text.length;
		sections.push({
			text: text.slice(start, end),
			query: headers[i].text,
			order: headers[i].order
		});
	}
	return sections;
}
//#endregion
//#region src/host/event-mirror.ts
/** Max parsed batches retained per session (oldest evicted first). */
const MAX_BATCHES_PER_SESSION = 50;
/** Tool names this mirror listens for. */
const TOOL_NAMES = /* @__PURE__ */ new Set(["anysearch_search", "anysearch_batch_search"]);
/** Concatenate all text blocks inside 'tool-result' content blocks. */
function extractRenderedText(message) {
	if (!message || !Array.isArray(message.content)) return "";
	const parts = [];
	for (const block of message.content) {
		if (!block || typeof block !== "object") continue;
		const candidate = block;
		if (candidate.type !== "tool-result") continue;
		const inner = candidate.content;
		if (!Array.isArray(inner)) continue;
		for (const item of inner) {
			if (!item || typeof item !== "object") continue;
			const textItem = item;
			if (textItem.type === "text" && typeof textItem.text === "string") parts.push(textItem.text);
		}
	}
	return parts.join("\n");
}
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** Create a per-session AnySearch results mirror.
*  Returns { get, getVersion, subscribe } + a dispose function.
*/
function createAnySearchMirror(ctx) {
	const perSession = /* @__PURE__ */ new Map();
	/** Monotonic per-session version, bumped whenever AnySearch batches are added. */
	const versions = /* @__PURE__ */ new Map();
	/** Per-session change listeners (for long-poll). */
	const listeners = /* @__PURE__ */ new Map();
	/** callIds active per session (for pairing tool/call → tool/result). */
	const callIds = /* @__PURE__ */ new Map();
	/** Tool name + raw arguments captured from each pending AnySearch call. */
	const callInfos = /* @__PURE__ */ new Map();
	const get = (sessionId) => perSession.get(sessionId) ?? [];
	const getVersion = (sessionId) => versions.get(sessionId) ?? 0;
	const subscribe = (sessionId, listener) => {
		let set = listeners.get(sessionId);
		if (set === void 0) {
			set = /* @__PURE__ */ new Set();
			listeners.set(sessionId, set);
		}
		set.add(listener);
		return () => {
			const current = listeners.get(sessionId);
			current?.delete(listener);
			if (current !== void 0 && current.size === 0) listeners.delete(sessionId);
		};
	};
	const notify = (sessionId) => {
		versions.set(sessionId, (versions.get(sessionId) ?? 0) + 1);
		const set = listeners.get(sessionId);
		if (!set) return;
		for (const listener of Array.from(set)) try {
			listener();
		} catch {}
	};
	if (typeof ctx.on !== "function") return {
		get,
		getVersion,
		subscribe,
		dispose: () => {}
	};
	const dispose = ctx.on("session/event", (session, event) => {
		const sid = session?.id;
		if (typeof sid !== "string") return;
		if (event.type === "tool/call") {
			const data = event.data ?? {};
			const name = data.name;
			const callId = data.callId;
			if (!TOOL_NAMES.has(typeof name === "string" ? name : "")) return;
			if (typeof callId !== "string") return;
			let ids = callIds.get(sid);
			if (ids === void 0) {
				ids = /* @__PURE__ */ new Set();
				callIds.set(sid, ids);
			}
			ids.add(callId);
			let infos = callInfos.get(sid);
			if (infos === void 0) {
				infos = /* @__PURE__ */ new Map();
				callInfos.set(sid, infos);
			}
			let args = data.arguments;
			if (typeof args === "string") try {
				args = JSON.parse(args);
			} catch {
				args = void 0;
			}
			infos.set(callId, {
				name: typeof name === "string" ? name : "",
				args
			});
			return;
		}
		if (event.type !== "tool/result") return;
		const message = (event.data ?? {}).message;
		const callId = message?.source?.callId;
		if (typeof callId !== "string") return;
		if (!callIds.get(sid)?.has(callId)) return;
		const renderedText = extractRenderedText(message);
		if (renderedText.length === 0) return;
		const validBatches = parseAnySearchRenderedText(renderedText).filter((b) => b.sources.length > 0);
		if (validBatches.length === 0) return;
		const callInfo = callInfos.get(sid)?.get(callId);
		if (callInfo && isRecord(callInfo.args)) {
			const args = callInfo.args;
			const callQuery = typeof args.query === "string" && args.query.length > 0 ? args.query : void 0;
			if (callInfo.name === "anysearch_batch_search" && Array.isArray(args.items)) for (const batch of validBatches) {
				if (batch.order !== void 0) {
					const item = args.items[batch.order - 1];
					if (isRecord(item)) batch.payload = item;
				}
				if (batch.query === void 0 && callQuery !== void 0) batch.query = callQuery;
			}
			else for (const batch of validBatches) {
				if (batch.query === void 0 && callQuery !== void 0) batch.query = callQuery;
				if (batch.payload === void 0) batch.payload = args;
			}
		}
		let list = perSession.get(sid);
		if (list === void 0) {
			list = [];
			perSession.set(sid, list);
		}
		list.unshift(...validBatches);
		if (list.length > MAX_BATCHES_PER_SESSION) list.length = MAX_BATCHES_PER_SESSION;
		notify(sid);
		const ids = callIds.get(sid);
		if (ids) ids.delete(callId);
		if (ids && ids.size === 0) callIds.delete(sid);
		const infos = callInfos.get(sid);
		if (infos) {
			infos.delete(callId);
			if (infos.size === 0) callInfos.delete(sid);
		}
	});
	ctx.effect(() => dispose, "dsh-anysearch-refs: event mirror");
	return {
		get,
		getVersion,
		subscribe,
		dispose
	};
}
//#endregion
//#region src/host/index.ts
/** Plugin name (must match cordis patch / dsh.plugin.json id). */
const NAME = "dsh-anysearch-refs";
/** Services required before mounting. */
const inject = ["webServer"];
/**
* Register the host-side API and event mirror.
* @param ctx - the cordis context (host half).
*/
function apply(ctx) {
	const mirror = createAnySearchMirror(ctx);
	const disposeRoute = ctx.webServer.register({
		kind: "exact",
		path: "/api/refs/anysearch",
		handler: async (req, res) => {
			if (req.method !== "POST") {
				res.writeHead(405, { "content-type": "application/json" });
				res.end(JSON.stringify({
					ok: false,
					error: {
						code: "method",
						message: "POST only"
					}
				}));
				return;
			}
			let bodyText = "";
			for await (const chunk of req) bodyText += typeof chunk === "string" ? chunk : String(chunk);
			let payload;
			try {
				payload = bodyText.length > 0 ? JSON.parse(bodyText) : {};
			} catch {
				res.writeHead(400, { "content-type": "application/json" });
				res.end(JSON.stringify({
					ok: false,
					error: {
						code: "bad-request",
						message: "invalid JSON"
					}
				}));
				return;
			}
			const sessionId = payload.sessionId;
			if (typeof sessionId !== "string" || sessionId.length === 0) {
				res.writeHead(400, { "content-type": "application/json" });
				res.end(JSON.stringify({
					ok: false,
					error: {
						code: "bad-request",
						message: "sessionId is required"
					}
				}));
				return;
			}
			const wait = payload.wait === true;
			const timeoutMs = typeof payload.timeoutMs === "number" && payload.timeoutMs > 0 ? Math.min(payload.timeoutMs, 6e4) : 3e4;
			if (wait) {
				const startVersion = mirror.getVersion(sessionId);
				let settled = false;
				let timer;
				let unsubscribe = () => {};
				const finish = () => {
					if (settled) return;
					settled = true;
					if (timer !== void 0) clearTimeout(timer);
					unsubscribe();
					if (!res.writableEnded && !res.destroyed) {
						const response = { batches: mirror.get(sessionId) };
						res.writeHead(200, { "content-type": "application/json" });
						res.end(JSON.stringify({
							ok: true,
							value: response
						}));
					}
				};
				unsubscribe = mirror.subscribe(sessionId, () => {
					if (mirror.getVersion(sessionId) > startVersion) finish();
				});
				res.on("close", finish);
				if (mirror.getVersion(sessionId) > startVersion) finish();
				timer = setTimeout(finish, timeoutMs);
				return;
			}
			const response = { batches: mirror.get(sessionId) };
			res.writeHead(200, { "content-type": "application/json" });
			res.end(JSON.stringify({
				ok: true,
				value: response
			}));
		}
	});
	ctx.effect(() => {
		return () => {
			disposeRoute();
			mirror.dispose();
		};
	}, `${NAME}: dispose route and mirror`);
}
//#endregion
export { NAME, apply, inject };
