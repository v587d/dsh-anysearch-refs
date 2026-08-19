/** dsh-anysearch-refs: top-level entry point.
 *
 *  Host half (Node.js): re-exports the host apply() which registers the
 *  /api/refs/anysearch route and the session event mirror.
 *
 *  Client half (browser): built separately into lib/client-registry.js
 *  by the build pipeline. The client registers the "AnySearch Refs" tab
 *  with ctx.betterSidebar.
 *
 *  The Context augmentation from dsh-better-sidebar is re-exported so
 *  consumers can do `import type {} from 'dsh-anysearch-refs'` and gain
 *  access to ctx.betterSidebar types (the augmentation is transitively
 *  provided by dsh-better-sidebar).
 */
import type {} from 'dsh-better-sidebar'  // triggers ctx.betterSidebar augmentation
import { apply as hostApply, NAME, inject } from './host/index.ts'

export { NAME, inject, hostApply as apply }
export type { AnySearchBatch, AnySearchSource, AnySearchResultsResponse } from './shared/types.ts'