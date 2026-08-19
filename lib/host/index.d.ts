/** Host half entry point: registers the /sidebar/api/anysearch.results
 *  route over the shared /sidebar/api gateway, backed by the event mirror.
 *
 *  Register pattern mirrors dsh-better-sidebar's src/index.ts — the
 *  sidebar's host half registers '/sidebar/api/*' routes with the host
 *  webServer, and the client fetches them via POST with { sessionId }.
 *
 *  We do NOT register a separate webServer route (that would need its
 *  own trust fence and conflict with better-sidebar's route namespace).
 *  Instead we rely on the sidebar's /sidebar/api gateway being extended
 *  via its internal route table. In practice the sidebar exposes a
 *  'register' hook or we piggy-back on its settings route.
 *
 *  For this v0.1.0 MVP we use a standalone approach: register our own
 *  /api/refs/anysearch route with the host's webServer service,
 *  fenced by the same trustedHosts the sidebar uses.
 */
import type { Context } from 'cordis';
/** Plugin name (must match cordis patch / dsh.plugin.json id). */
export declare const NAME = "dsh-anysearch-refs";
/** Services required before mounting. */
export declare const inject: string[];
/**
 * Register the host-side API and event mirror.
 * @param ctx - the cordis context (host half).
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map