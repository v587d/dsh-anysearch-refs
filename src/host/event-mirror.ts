/** Host half of dsh-anysearch-refs: watches the DSH session event stream,
 *  pairs anysearch tool/call with its tool/result via callId, extracts
 *  the rendered markdown text from the result's tool-result blocks,
 *  parses it with the shared parser, and stores per-session batches.
 *
 *  Zero DSH writes: reads only from the session event log and the live
 *  session/event push. The model's tool cursor is never touched.
 *
 *  Architecture mirrors dsh-better-sidebar's createJobOutputMirror
 *  (src/jobs-routes.ts): the same ctx.on('session/event', ...) pattern,
 *  callId-based pairing, per-session bounded ring buffer.
 */
import type { Context } from 'cordis'
import type { AnySearchBatch } from '../shared/types.ts'
import { parseAnySearchRenderedText } from '../shared/parser'

// ── Configuration ────────────────────────────────────────────────────

/** Max parsed batches retained per session (oldest evicted first). */
const MAX_BATCHES_PER_SESSION = 50

/** Tool names this mirror listens for. */
const TOOL_NAMES = new Set(['anysearch_search', 'anysearch_batch_search'])

// ── Structural types (mirror of DSH session event shapes) ────────────

interface SessionId {
  id?: unknown
}

interface ToolCallData {
  name?: unknown
  callId?: unknown
  arguments?: unknown
}

interface ToolResultMessage {
  source?: { callId?: unknown }
  content?: unknown[]
}

interface ToolResultBlock {
  type?: unknown
  content?: unknown[]
}

interface TextBlock {
  type?: unknown
  text?: unknown
}

// ── Extract rendered text from a tool/result message ─────────────────

/** Concatenate all text blocks inside 'tool-result' content blocks. */
export function extractRenderedText(message: ToolResultMessage | undefined): string {
  if (!message || !Array.isArray(message.content)) return ''
  const parts: string[] = []
  for (const block of message.content) {
    if (!block || typeof block !== 'object') continue
    const candidate = block as ToolResultBlock
    if (candidate.type !== 'tool-result') continue
    const inner = candidate.content
    if (!Array.isArray(inner)) continue
    for (const item of inner) {
      if (!item || typeof item !== 'object') continue
      const textItem = item as TextBlock
      if (textItem.type === 'text' && typeof textItem.text === 'string') {
        parts.push(textItem.text)
      }
    }
  }
  return parts.join('\n')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// ── Public factory ───────────────────────────────────────────────────

/** Create a per-session AnySearch results mirror.
 *  Returns { get, getVersion, subscribe } + a dispose function.
 */
export function createAnySearchMirror(
  ctx: Context,
): {
  get: (sessionId: string) => AnySearchBatch[]
  /** Monotonic change counter per session; long-poll uses it to detect new data. */
  getVersion: (sessionId: string) => number
  /** Subscribe to AnySearch data changes for one session; returns an unsubscribe fn. */
  subscribe: (sessionId: string, listener: () => void) => () => void
  dispose: () => void
} {
  const perSession = new Map<string, AnySearchBatch[]>()
  /** Monotonic per-session version, bumped whenever AnySearch batches are added. */
  const versions = new Map<string, number>()
  /** Per-session change listeners (for long-poll). */
  const listeners = new Map<string, Set<() => void>>()
  /** callIds active per session (for pairing tool/call → tool/result). */
  const callIds = new Map<string, Set<string>>()
  /** Tool name + raw arguments captured from each pending AnySearch call. */
  const callInfos = new Map<string, Map<string, { name: string; args: unknown }>>()

  const get = (sessionId: string): AnySearchBatch[] => perSession.get(sessionId) ?? []

  const getVersion = (sessionId: string): number => versions.get(sessionId) ?? 0

  const subscribe = (sessionId: string, listener: () => void): (() => void) => {
    let set = listeners.get(sessionId)
    if (set === undefined) {
      set = new Set()
      listeners.set(sessionId, set)
    }
    set.add(listener)
    return () => {
      const current = listeners.get(sessionId)
      current?.delete(listener)
      if (current !== undefined && current.size === 0) listeners.delete(sessionId)
    }
  }

  const notify = (sessionId: string): void => {
    versions.set(sessionId, (versions.get(sessionId) ?? 0) + 1)
    const set = listeners.get(sessionId)
    if (!set) return
    for (const listener of Array.from(set)) {
      try { listener() } catch { /* listener errors must not break the mirror */ }
    }
  }

  // ctx.on may be absent in test doubles (degrade to seed-only).
  if (typeof ctx.on !== 'function') {
    return { get, getVersion, subscribe, dispose: () => {} }
  }

  const dispose = ctx.on('session/event', (session, event) => {
    const sid = (session as SessionId)?.id
    if (typeof sid !== 'string') return

    // tool/call: remember the callId for anysearch tools.
    if (event.type === 'tool/call') {
      const data = (event.data as ToolCallData) ?? {}
      const name = data.name
      const callId = data.callId
      if (!TOOL_NAMES.has(typeof name === 'string' ? name : '')) return
      if (typeof callId !== 'string') return

      let ids = callIds.get(sid)
      if (ids === undefined) {
        ids = new Set()
        callIds.set(sid, ids)
      }
      ids.add(callId)

      let infos = callInfos.get(sid)
      if (infos === undefined) {
        infos = new Map()
        callInfos.set(sid, infos)
      }
      // DSH's session event stores `arguments` as a raw JSON string (exactly
      // as the model produced it). Normalize it here so later code can treat
      // it as an object without losing the query/payload.
      let args: unknown = data.arguments
      if (typeof args === 'string') {
        try {
          args = JSON.parse(args)
        } catch {
          args = undefined
        }
      }
      infos.set(callId, { name: typeof name === 'string' ? name : '', args })
      return
    }

    // tool/result: pair via callId, extract text, parse.
    if (event.type !== 'tool/result') return
    const data = (event.data as { message?: unknown }) ?? {}
    const message = data.message as ToolResultMessage | undefined
    const callId = message?.source?.callId
    if (typeof callId !== 'string') return
    if (!callIds.get(sid)?.has(callId)) return

    const renderedText = extractRenderedText(message)
    if (renderedText.length === 0) return

    const batches = parseAnySearchRenderedText(renderedText)
    // Filter out empty batches (no sources parsed).
    const validBatches = batches.filter(b => b.sources.length > 0)
    if (validBatches.length === 0) return

    // Recover payload/query from the tool/call arguments. Single-search
    // renders do not carry the query text; batch sections carry per-item
    // queries and their 1-based order, which we use to pair each batch with
    // the matching `items[i]` payload.
    const callInfo = callInfos.get(sid)?.get(callId)
    if (callInfo && isRecord(callInfo.args)) {
      const args = callInfo.args
      const callQuery = typeof args.query === 'string' && args.query.length > 0 ? args.query : undefined
      if (callInfo.name === 'anysearch_batch_search' && Array.isArray(args.items)) {
        for (const batch of validBatches) {
          if (batch.order !== undefined) {
            const item = args.items[batch.order - 1]
            if (isRecord(item)) batch.payload = item
          }
          if (batch.query === undefined && callQuery !== undefined) batch.query = callQuery
        }
      } else {
        for (const batch of validBatches) {
          if (batch.query === undefined && callQuery !== undefined) batch.query = callQuery
          if (batch.payload === undefined) batch.payload = args
        }
      }
    }

    let list = perSession.get(sid)
    if (list === undefined) {
      list = []
      perSession.set(sid, list)
    }
    // newest first
    list.unshift(...validBatches)
    if (list.length > MAX_BATCHES_PER_SESSION) {
      list.length = MAX_BATCHES_PER_SESSION
    }

    // Wake any long-polling request for this session.
    notify(sid)

    // Clean up callId after consumption.
    const ids = callIds.get(sid)
    if (ids) ids.delete(callId)
    if (ids && ids.size === 0) callIds.delete(sid)

    const infos = callInfos.get(sid)
    if (infos) {
      infos.delete(callId)
      if (infos.size === 0) callInfos.delete(sid)
    }
  })

  ctx.effect(() => dispose, 'dsh-anysearch-refs: event mirror')

  return { get, getVersion, subscribe, dispose }
}