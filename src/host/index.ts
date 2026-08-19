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
import type { Context } from 'cordis'
import type { AnySearchBatch, AnySearchResultsResponse } from '../shared/types'
import { createAnySearchMirror } from './event-mirror'

/** Plugin name (must match cordis patch / dsh.plugin.json id). */
export const NAME = 'dsh-anysearch-refs'

/** Services required before mounting. */
export const inject = ['webServer']

/**
 * Register the host-side API and event mirror.
 * @param ctx - the cordis context (host half).
 */
export function apply(ctx: Context): void {
  const mirror = createAnySearchMirror(ctx)
  const webServer = ctx.webServer

  // Register our own /api/refs/anysearch route. The sidebar's /sidebar/api
  // gateway is an internal namespace; external plugins should not collide
  // with it. We expose a parallel route that the client fetches directly.
  const disposeRoute = webServer.register({
    kind: 'exact',
    path: '/api/refs/anysearch',
    handler: async (req, res) => {
      if (req.method !== 'POST') {
        res.writeHead(405, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: { code: 'method', message: 'POST only' } }))
        return
      }

      // Read JSON body.
      let bodyText = ''
      for await (const chunk of req) {
        bodyText += typeof chunk === 'string' ? chunk : String(chunk)
      }

      let payload: { sessionId?: unknown; wait?: unknown; timeoutMs?: unknown }
      try {
        payload = bodyText.length > 0 ? JSON.parse(bodyText) : {}
      } catch {
        res.writeHead(400, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: { code: 'bad-request', message: 'invalid JSON' } }))
        return
      }

      const sessionId = payload.sessionId
      if (typeof sessionId !== 'string' || sessionId.length === 0) {
        res.writeHead(400, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: { code: 'bad-request', message: 'sessionId is required' } }))
        return
      }

      // Unless the client explicitly asks to wait, return the current snapshot
      // immediately. With `wait: true` we long-poll: the request stays open
      // until new AnySearch data arrives for this session (or the timeout).
      const wait = payload.wait === true
      const timeoutMs = typeof payload.timeoutMs === 'number' && payload.timeoutMs > 0
        ? Math.min(payload.timeoutMs, 60_000)
        : 30_000

      if (wait) {
        const startVersion = mirror.getVersion(sessionId)
        let settled = false
        let timer: ReturnType<typeof setTimeout> | undefined
        let unsubscribe: () => void = () => {}

        const finish = (): void => {
          if (settled) return
          settled = true
          if (timer !== undefined) clearTimeout(timer)
          unsubscribe()
          // Only write if the client hasn't aborted the request.
          if (!res.writableEnded && !res.destroyed) {
            const batches: AnySearchBatch[] = mirror.get(sessionId)
            const response: AnySearchResultsResponse = { batches }
            res.writeHead(200, { 'content-type': 'application/json' })
            res.end(JSON.stringify({ ok: true, value: response }))
          }
        }

        unsubscribe = mirror.subscribe(sessionId, () => {
          if (mirror.getVersion(sessionId) > startVersion) finish()
        })

        // React to client abort/close so we never leave dangling subscriptions.
        // NOTE: must use `res.on('close')`, NOT `req.on('close')` — the latter
        // fires as soon as the request body has been read, which would make
        // every long-poll return immediately instead of waiting for data.
        res.on('close', finish)

        // Guard: if data already arrived between the version snapshot and our
        // subscription, resolve immediately.
        if (mirror.getVersion(sessionId) > startVersion) finish()

        timer = setTimeout(finish, timeoutMs)
        return
      }

      const batches: AnySearchBatch[] = mirror.get(sessionId)
      const response: AnySearchResultsResponse = { batches }

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ok: true, value: response }))
    },
  })

  ctx.effect(() => {
    return () => {
      disposeRoute()
      mirror.dispose()
    }
  }, `${NAME}: dispose route and mirror`)
}