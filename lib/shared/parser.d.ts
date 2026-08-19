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
import type { AnySearchBatch } from './types.ts';
/** Parse rendered text into one or more batches.
 *  For anysearch_search the text contains one Sources block → one batch.
 *  For anysearch_batch_search the text contains N "## N." sections,
 *  each with its own Sources block → N batches.
 */
export declare function parseAnySearchRenderedText(text: string): AnySearchBatch[];
/** Convenience: parse and return the first batch (for single-search flows). */
export declare function parseFirstBatch(text: string): AnySearchBatch | undefined;
//# sourceMappingURL=parser.d.ts.map