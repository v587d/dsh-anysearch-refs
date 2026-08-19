/** Pure regex parser over AnySearch tool-result rendered text.
 *  Shared between host (event mirror) and tests. Free of framework deps.
 *
 *  Formats parsed:
 *  - anysearch_search render:
 *      AnySearch returned N result(s) in M ms.
 *      Request ID: xxx
 *      Sources:
 *      - [Title](URL) — Snippet
 *      - [Title](URL) — Snippet
 *      Cite relevant source URLs as markdown links in the answer.
 *  - anysearch_batch_search render (per-item section):
 *      ## N. query
 *      Request ID: xxx
 *      Sources:
 *      - [Title](URL) — Snippet
 *      ...
 *
 *  We intentionally parse ONLY the rendered text (never the canonical
 *  structured JSON) because that is the shape available from the
 *  session event log's tool/result rows.
 */
import type { AnySearchBatch, AnySearchSource } from './types.ts'

// ── Regex constants (compiled once for hot-path use) ──────────────────

/** Meta line: "AnySearch returned 3 result(s) in 2359 ms." */
const META_RE = /AnySearch returned (\d+) result\(s\) in (\d+) ms\./

/** Request ID line: "Request ID: 44e2f296-9f20-4a76-80ca-0ff8f53b2b03" */
const REQUEST_ID_RE = /Request ID: ([\w-]+)/

/** Source line: "- [Title](URL) — Snippet" (snippet optional).
 *  Non-greedy (.+?) for title; URL uses https?:\/\/ + non-greedy up to
 *  the closing paren that is followed by " — " or end-of-line, so
 *  parenthesised URLs like Wikipedia paths are handled by backtracking.
 */
const SOURCE_RE = /^- \[(.+?)\]\((https?:\/\/.+?)\)(?: — (.+))?$/gm

/** Batch section header: "## 1. query text" */
const BATCH_SECTION_RE = /^## (\d+)\.\s+(.+)$/gm

// ── Public API ───────────────────────────────────────────────────────

/** Parse rendered text into one or more batches.
 *  For anysearch_search the text contains one Sources block → one batch.
 *  For anysearch_batch_search the text contains N "## N." sections,
 *  each with its own Sources block → N batches.
 */
export function parseAnySearchRenderedText(text: string): AnySearchBatch[] {
  if (text.length === 0) return []

  const sections = splitSections(text)
  return sections.map(section => parseSingleSection(section.text, section.query, section.order))
}

/** Parse a single section (one anysearch_search result or one batch item). */
function parseSingleSection(text: string, query?: string, order?: number): AnySearchBatch {
  const batch: AnySearchBatch = {
    timestamp: Date.now(),
    ...(query !== undefined ? { query } : {}),
    ...(order !== undefined ? { order } : {}),
    sources: [],
  }

  const metaMatch = META_RE.exec(text)
  if (metaMatch) {
    batch.totalResults = parseInt(metaMatch[1], 10)
    batch.searchTimeMs = parseInt(metaMatch[2], 10)
  }

  const reqIdMatch = REQUEST_ID_RE.exec(text)
  if (reqIdMatch) batch.requestId = reqIdMatch[1]

  const sources: AnySearchSource[] = []
  SOURCE_RE.lastIndex = 0 // reset for fresh scan
  let m: RegExpExecArray | null
  while ((m = SOURCE_RE.exec(text)) !== null) {
    sources.push({
      title: m[1].trim(),
      url: m[2].trim(),
      snippet: m[3] ? m[3].trim() : undefined,
    })
  }

  batch.sources = sources
  return batch
}

/** Split rendered text on "## N." section headers.
 *  Returns an array of sections: [before-first-header?, ...sections].
 *  If no headers found, returns [text] (single batch).
 */
function splitSections(text: string): Array<{ text: string; query?: string; order?: number }> {
  const headers: { index: number; order: number; text: string }[] = []
  let m: RegExpExecArray | null
  BATCH_SECTION_RE.lastIndex = 0
  while ((m = BATCH_SECTION_RE.exec(text)) !== null) {
    headers.push({ index: m.index, order: parseInt(m[1], 10), text: m[2] })
  }

  if (headers.length === 0) return [{ text, query: undefined, order: undefined }]

  const sections: Array<{ text: string; query?: string; order?: number }> = []
  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].index
    const end = i < headers.length - 1 ? headers[i + 1].index : text.length
    sections.push({
      text: text.slice(start, end),
      query: headers[i].text,
      order: headers[i].order,
    })
  }
  return sections
}

/** Convenience: parse and return the first batch (for single-search flows). */
export function parseFirstBatch(text: string): AnySearchBatch | undefined {
  const batches = parseAnySearchRenderedText(text)
  return batches[0]
}
