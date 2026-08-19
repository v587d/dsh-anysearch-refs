/** Shared types consumed by both host and client halves.
 *  Free of Node.js types — importable by the browser client bundle. */
/** One parsed search source (title + URL + optional snippet). */
export interface AnySearchSource {
    title: string;
    url: string;
    snippet?: string;
}
/** One parsed search batch (a single anysearch_search or one item of anysearch_batch_search). */
export interface AnySearchBatch {
    /** Milliseconds since Unix epoch when this batch was captured. */
    timestamp: number;
    /** The model's search query text (from the tool/call arguments or batch header). */
    query?: string;
    /** 1-based index inside anysearch_batch_search (matches the rendered "## N." header). */
    order?: number;
    /** Raw tool/call payload fields for this search (query, zone, language, tag, params, …). */
    payload?: Record<string, unknown>;
    /** AnySearch request id. */
    requestId?: string;
    /** Total results reported by AnySearch. */
    totalResults?: number;
    /** Search duration in ms. */
    searchTimeMs?: number;
    /** Parsed sources. */
    sources: AnySearchSource[];
}
/** The full response the client fetches from the host API. */
export interface AnySearchResultsResponse {
    batches: AnySearchBatch[];
}
//# sourceMappingURL=types.d.ts.map