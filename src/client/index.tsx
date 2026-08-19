/** Client half of dsh-anysearch-refs: registers the "AnySearch Refs" tab
 *  with ctx.betterSidebar and renders parsed search sources as clickable
 *  cards.
 *
 *  Build: this file is compiled into lib/client.js and
 *  lib/client-registry.js by tsdown (see tsdown.config.ts).
 *  The factory receives `require` for module-table lookups (react, cordis).
 *
 *  Only type-only imports from dsh-better-sidebar (erased at compile time,
 *  no runtime dependency). React is resolved through the module table.
 */
import type {} from 'dsh-better-sidebar'  // triggers ctx.betterSidebar augmentation
import type { Context } from 'cordis'
import { IconSearchOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'

// ── Types (re-declared locally — the shared types module is Node-only) ──

interface AnySearchSource {
  title: string
  url: string
  snippet?: string
}

interface AnySearchBatch {
  timestamp: number
  query?: string
  order?: number
  payload?: Record<string, unknown>
  requestId?: string
  totalResults?: number
  searchTimeMs?: number
  sources: AnySearchSource[]
}

interface AnySearchResultsResponse {
  batches: AnySearchBatch[]
}

// ── CSS (injected as <style data-plugin> by the build pipeline) ──────

import css from './styles.module.css'

// ── Constants ────────────────────────────────────────────────────────

const TAB_ID = 'anysearch-refs:anysearch-refs'
/** Content seed used to auto-expand the right panel when opening. */
const AUTO_OPEN_SEED_PATH = 'anysearch://refs'
/** Same sandbox policy as dsh-better-sidebar's built-in browser tab. */
const PREVIEW_IFRAME_SANDBOX =
  'allow-scripts allow-forms allow-popups allow-downloads allow-modals allow-popups-to-escape-sandbox'
// Cordis service dependency. The client bundle must declare this so reading
// `ctx.betterSidebar` is allowed; without it Cordis throws
// `cannot get property "betterSidebar" without inject`.
export const inject = ['betterSidebar']

// ── Fetch helper ─────────────────────────────────────────────────────

async function fetchResults(sessionId: string, signal: AbortSignal, wait = false): Promise<AnySearchResultsResponse> {
  const res = await fetch('/api/refs/anysearch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId, wait, timeoutMs: 30_000 }),
    signal,
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  const parsed = await res.json()
  if (!parsed?.ok || !parsed?.value) {
    throw new Error('unexpected response shape')
  }
  return parsed.value
}

// ── Helpers ─────────────────────────────────────────────────────────

function safeHostname(url: string): string {
  try { return new URL(url).hostname } catch { return url }
}

function totalSources(batches: AnySearchBatch[]): number {
  return batches.reduce((sum, b) => sum + b.sources.length, 0)
}

function formatTimeAgo(ts: number): string {
  const diffMs = Date.now() - ts
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return new Date(ts).toLocaleDateString()
}

function formatPayloadValue(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value)
  if (value === undefined) return 'undefined'
  if (typeof value === 'object' && value !== null) {
    try { return JSON.stringify(value) } catch { return String(value) }
  }
  return String(value)
}

/** Render every raw payload field as `key: value`, joined for the meta line. */
function formatPayload(payload?: Record<string, unknown>): string {
  if (!payload) return ''
  return Object.entries(payload)
    .map(([key, value]) => `${key}: ${formatPayloadValue(value)}`)
    .join(' · ')
}

function batchSignature(batch: AnySearchBatch): string {
  return JSON.stringify([
    batch.requestId ?? '',
    batch.timestamp ?? 0,
    batch.query ?? '',
    batch.payload ?? null,
    ...batch.sources.map(s => `${s.title}|${s.url}|${s.snippet ?? ''}`),
  ])
}

function resultsSignature(batches: AnySearchBatch[]): string {
  return batches.slice(0, 10).map(batchSignature).join('\n')
}

/** Case-insensitive literal highlight; only used in snippets, never titles. */
function highlightSnippet(text: string, query?: string): Array<string | JSX.Element> {
  if (!query || !text) return [text]
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  if (!lowerQuery) return [text]

  const parts: Array<string | JSX.Element> = []
  let index = 0
  let start = lowerText.indexOf(lowerQuery)
  let key = 0
  while (start !== -1) {
    if (start > index) parts.push(text.slice(index, start))
    parts.push(
      <mark className={css.highlight} key={key++}>
        {text.slice(start, start + query.length)}
      </mark>,
    )
    index = start + query.length
    start = lowerText.indexOf(lowerQuery, index)
  }
  if (index < text.length) parts.push(text.slice(index))
  return parts
}

/** Return the id of the first leaf in the right split tree. */
type SplitNodeLike = { kind?: string; id?: string; children?: SplitNodeLike[]; tabs?: Array<{ type?: string }> }

/** Return the id of the first leaf in the right split tree. */
function firstRightLeafId(state: { splits?: unknown }): string {
  let node = state.splits as SplitNodeLike | undefined
  while (node && node.kind !== 'leaf') {
    const children = node.children
    node = Array.isArray(children) ? children[0] : undefined
  }
  return node?.id ?? ''
}

/** Return the right-pane leaf that already hosts AnySearch Refs, if any. */
function rightLeafForRefs(state: { splits?: unknown }): string {
  const walk = (node: SplitNodeLike | undefined): string | undefined => {
    if (!node) return undefined
    if (node.kind === 'leaf') {
      return Array.isArray(node.tabs) && node.tabs.some(tab => tab.type === TAB_ID)
        ? node.id
        : undefined
    }
    for (const child of node.children ?? []) {
      const found = walk(child)
      if (found !== undefined) return found
    }
    return undefined
  }
  return walk(state.splits as SplitNodeLike | undefined) ?? firstRightLeafId(state)
}

// ── Tab component ────────────────────────────────────────────────────

function AnySearchRefsTab(props: {
  ctx: Context
  scope: { sessionId: string }
  visible: boolean
}): JSX.Element {
  const { scope, visible } = props
  const [batches, setBatches] = useState<Array<AnySearchBatch>>([])
  const controllerRef = useRef<AbortController | undefined>(undefined)

  useEffect(() => {
    if (!visible) {
      controllerRef.current?.abort()
      return
    }
    const ctrl = new AbortController()
    controllerRef.current = ctrl
    let cancelled = false

    const loop = async (): Promise<void> => {
      // First call returns immediately, then we long-poll so the host wakes
      // us only when new AnySearch data arrives (or the 30s keepalive fires).
      let first = true
      while (!cancelled) {
        try {
          const data = await fetchResults(scope.sessionId, ctrl.signal, !first)
          if (cancelled) return
          setBatches(data.batches ?? [])
          first = false
        } catch (err) {
          if (ctrl.signal.aborted || cancelled) return
          const msg = err instanceof Error ? err.message : String(err)
          console.warn(`[dsh-anysearch-refs] fetch failed: ${msg}`)
          // On transient errors, back off a little instead of hammering.
          await new Promise(r => setTimeout(r, 2000))
        }
      }
    }

    void loop()
    return () => {
      cancelled = true
      ctrl.abort()
    }
  }, [scope.sessionId, visible])

  if (batches.length === 0) {
    return (
      <div className={css.empty}>
        <div className={css.emptyIcon}>🔍</div>
        <div className={css.emptyTitle}>AnySearch Refs</div>
        <div className={css.emptyHint}>
          Search results will appear here when the assistant uses AnySearch.
        </div>
      </div>
    )
  }

  return (
    <div className={css.container}>
      <div className={css.header}>
        <span className={css.headerTitle}>All references</span>
        <span className={css.headerCount}>{totalSources(batches)} sources</span>
      </div>
      <div className={css.scrollArea}>
        {batches.map((batch, bi) => (
          <SearchBatchCard key={bi} batch={batch} />
        ))}
      </div>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────

function SearchBatchCard(props: {
  batch: AnySearchBatch
}): JSX.Element {
  const { batch } = props
  const timeAgo = formatTimeAgo(batch.timestamp)
  // Extract the search query: prefer batch.query, fall back to payload.query
  const query = batch.query
    ?? (typeof batch.payload?.query === 'string' ? batch.payload.query : undefined)
  const meta = [
    batch.totalResults !== undefined ? `${batch.totalResults} results` : null,
    batch.searchTimeMs !== undefined ? `${batch.searchTimeMs}ms` : null,
    batch.requestId ? `Req: ${batch.requestId.slice(0, 8)}…` : null,
  ].filter(Boolean)

  return (
    <div className={css.batchCard}>
      <div className={css.batchHeader}>
        <div className={css.batchHeaderLeft}>
          {query && (
            <div className={css.batchQuery} title={query}>🔍 {query}</div>
          )}
          {meta.length > 0 && (
            <div className={css.batchMeta}>{meta.join(' · ')}</div>
          )}
        </div>
        <span className={css.batchTime}>{timeAgo}</span>
      </div>
      <div className={css.sourcesList}>
        {batch.sources.map((source, si) => (
          <SourceCard
            key={si}
            source={source}
            query={query}
          />
        ))}
      </div>
    </div>
  )
}

function SourceCard(props: {
  source: AnySearchSource
  query?: string
}): JSX.Element {
  const { source, query } = props
  const hostname = safeHostname(source.url)
  const label = source.title || hostname

  return (
    <div className={css.sourceCard}>
      <div className={css.sourceBody}>
        <a
          className={css.sourceTitle}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          title={source.url}
        >
          {label}
        </a>
        <div className={css.sourceUrlLine}>
          <a
            className={css.sourceUrl}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            title={source.url}
          >
            {hostname}
          </a>
        </div>
        {source.snippet && (
          <div className={css.sourceSnippet}>{highlightSnippet(source.snippet, query)}</div>
        )}
      </div>
    </div>
  )
}

// ── React hooks (from module table) ──────────────────────────────────

const { useState, useEffect, useCallback, useRef } = require('react')

// ── Tab descriptor & registration ────────────────────────────────────

/**
 * Client plugin entry point (called by the DSH client runtime).
 * @param ctx - the client cordis context.
 */
export function apply(ctx: Context): void {
  // dsh-better-sidebar may not be installed — guard against it.
  if (!ctx.betterSidebar) {
    console.warn(`[dsh-anysearch-refs] dsh-better-sidebar not available; skipping tab registration`)
    return
  }

  ctx.effect(() =>
    ctx.betterSidebar!.registerTab({
      id: TAB_ID,
      title: 'AnySearch Refs',
      icon: (size: number) => <IconSearchOutline16 size={size} />,
      order: 60,
      single: true,
      // Keep AnySearch Refs in the right-hand workbench even when a search
      // result auto-opens it from another active pane.
      createTab: (state) => ({
        tab: { id: TAB_ID, type: TAB_ID, title: 'AnySearch Refs' },
        patch: { activePane: rightLeafForRefs(state) },
      }),
      component: (props) => <AnySearchRefsTab {...props} />,
    }),
  )

  // Background watcher: when AnySearch result batches appear, open the
  // sidebar tab (and expand the right panel) without waiting for the user to
  // click the + menu. The first observation of a session records the baseline
  // while still surfacing results that were already present; later polls only
  // auto-open on a changed signature.
  ctx.effect(() => {
    const service = ctx.betterSidebar
    if (!service || typeof service.getSnapshot !== 'function' || typeof service.openTab !== 'function') {
      return undefined
    }

    const seen = new Map<string, string>()
    let disposed = false
    let controller: AbortController | undefined

    const loop = async (): Promise<void> => {
      let first = true
      while (!disposed) {
        const sessionId = service.getSnapshot()?.sessionId
        if (!sessionId || service.isTabEnabled?.(TAB_ID) === false) {
          // No active session yet or the tab is disabled. Retry shortly —
          // this watcher runs for the whole profile lifetime and must recover
          // as soon as a session becomes available (unlike a one-shot poll).
          await new Promise(r => setTimeout(r, 1000))
          continue
        }

        controller?.abort()
        const ctrl = new AbortController()
        controller = ctrl
        try {
          // First call immediate, then long-poll: the host wakes us only when
          // this session's AnySearch data changes (or the 30s keepalive fires).
          const data = await fetchResults(sessionId, ctrl.signal, !first)
          if (disposed || ctrl.signal.aborted) return
          if (service.getSnapshot()?.sessionId !== sessionId) {
            // Session switched while the request was in flight — restart for
            // the new session instead of dropping out of the loop.
            first = true
            continue
          }
          const batches = data.batches ?? []
          const signature = resultsSignature(batches)
          const previous = seen.get(sessionId)
          if (signature.length > 0 && signature !== previous) {
            service.openTab(
              { type: TAB_ID, title: 'AnySearch Refs', path: AUTO_OPEN_SEED_PATH },
              { sessionId },
            )
          }
          seen.set(sessionId, signature)
          first = false
        } catch (err) {
          if (ctrl.signal.aborted || disposed) return
          console.warn(`[dsh-anysearch-refs] auto-open poll failed: ${err instanceof Error ? err.message : String(err)}`)
          await new Promise(r => setTimeout(r, 2000))
        }
      }
    }

    void loop()

    return () => {
      disposed = true
      controller?.abort()
    }
  }, 'dsh-anysearch-refs: auto-open watcher')
}
