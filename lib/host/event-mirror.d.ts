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
import type { Context } from 'cordis';
import type { AnySearchBatch } from '../shared/types.ts';
interface ToolResultMessage {
    source?: {
        callId?: unknown;
    };
    content?: unknown[];
}
/** Concatenate all text blocks inside 'tool-result' content blocks. */
export declare function extractRenderedText(message: ToolResultMessage | undefined): string;
/** Create a per-session AnySearch results mirror.
 *  Returns { get, getVersion, subscribe } + a dispose function.
 */
export declare function createAnySearchMirror(ctx: Context): {
    get: (sessionId: string) => AnySearchBatch[];
    /** Monotonic change counter per session; long-poll uses it to detect new data. */
    getVersion: (sessionId: string) => number;
    /** Subscribe to AnySearch data changes for one session; returns an unsubscribe fn. */
    subscribe: (sessionId: string, listener: () => void) => () => void;
    dispose: () => void;
};
export {};
//# sourceMappingURL=event-mirror.d.ts.map