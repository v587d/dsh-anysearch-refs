/** Tests for extractRenderedText — the function that pulls rendered
 *  markdown text from a DSH tool/result event's message content. */
import { describe, expect, it } from 'vitest'
import { createAnySearchMirror, extractRenderedText } from '../src/host/event-mirror.ts'

describe('extractRenderedText', () => {
  it('extracts text from a single tool-result block', () => {
    const message = {
      source: { callId: 'call-1' },
      content: [
        {
          type: 'tool-result',
          content: [
            { type: 'text', text: 'AnySearch returned 3 result(s) in 2359 ms.' },
          ],
        },
      ],
    }
    expect(extractRenderedText(message)).toBe('AnySearch returned 3 result(s) in 2359 ms.')
  })

  it('concatenates multiple text blocks', () => {
    const message = {
      source: { callId: 'call-1' },
      content: [
        {
          type: 'tool-result',
          content: [
            { type: 'text', text: 'Line 1' },
            { type: 'text', text: 'Line 2' },
          ],
        },
      ],
    }

  })

  it('skips non-tool-result blocks', () => {
    const message = {
      source: { callId: 'call-1' },
      content: [
        { type: 'text', text: 'This should be ignored' },
        {
          type: 'tool-result',
          content: [
            { type: 'text', text: 'Real content' },
          ],
        },
      ],
    }
    expect(extractRenderedText(message)).toBe('Real content')
  })

  it('returns empty string for undefined message', () => {
    expect(extractRenderedText(undefined)).toBe('')
  })

  it('returns empty string for message without content', () => {
    expect(extractRenderedText({ source: { callId: 'call-1' } })).toBe('')
  })

  it('returns empty string when content has no text blocks', () => {
    const message = {
      source: { callId: 'call-1' },
      content: [
        {
          type: 'tool-result',
          content: [
            { type: 'image', url: 'https://example.com/img.png' },
          ],
        },
      ],
    }
    expect(extractRenderedText(message)).toBe('')
  })
})

describe('createAnySearchMirror payload capture', () => {
  function createMockCtx() {
    const listeners = new Map<string, Array<(session: unknown, event: unknown) => void>>()
    const ctx = {
      on(event: string, listener: (session: unknown, event: unknown) => void) {
        const list = listeners.get(event) ?? []
        list.push(listener)
        listeners.set(event, list)
        return () => {
          const current = listeners.get(event) ?? []
          const index = current.indexOf(listener)
          if (index >= 0) current.splice(index, 1)
        }
      },
      effect() {},
      emit(event: string, session: unknown, payload: unknown) {
        for (const listener of listeners.get(event) ?? []) listener(session, payload)
      },
    }
    return ctx
  }

  const singleResultMessage = (callId: string) => ({
    source: { callId },
    content: [{
      type: 'tool-result',
      content: [{
        type: 'text',
        text: `AnySearch returned 1 result(s) in 100 ms.\n\nRequest ID: req-single\n\nSources:\n\n- [Example](https://example.com) — Example snippet\n\nCite relevant source URLs as markdown links in the answer.`,
      }],
    }],
  })

  it('attaches the raw single-search payload and query', () => {
    const ctx = createMockCtx() as any
    const mirror = createAnySearchMirror(ctx)
    ctx.emit('session/event', { id: 's1' }, {
      type: 'tool/call',
      data: {
        name: 'anysearch_search',
        callId: 'call-single',
        arguments: { query: 'deepseek ai agent harness', zone: 'Intl', maxResults: 5 },
      },
    })
    ctx.emit('session/event', { id: 's1' }, {
      type: 'tool/result',
      data: { message: singleResultMessage('call-single') },
    })

    const batches = mirror.get('s1')
    expect(batches).toHaveLength(1)
    expect(batches[0].query).toBe('deepseek ai agent harness')
    expect(batches[0].payload).toEqual({ query: 'deepseek ai agent harness', zone: 'Intl', maxResults: 5 })
    expect(batches[0].sources).toHaveLength(1)
  })

  it('parses JSON-string tool arguments (real DSH session event shape)', () => {
    const ctx = createMockCtx() as any
    const mirror = createAnySearchMirror(ctx)
    ctx.emit('session/event', { id: 's1' }, {
      type: 'tool/call',
      data: {
        name: 'anysearch_search',
        callId: 'call-single-json',
        arguments: JSON.stringify({ query: '金铲铲之战 羁绊', zone: 'cn' }),
      },
    })
    ctx.emit('session/event', { id: 's1' }, {
      type: 'tool/result',
      data: { message: singleResultMessage('call-single-json') },
    })

    const batches = mirror.get('s1')
    expect(batches).toHaveLength(1)
    expect(batches[0].query).toBe('金铲铲之战 羁绊')
    expect(batches[0].payload).toEqual({ query: '金铲铲之战 羁绊', zone: 'cn' })
  })


  it('maps batch payloads by the rendered section order', () => {
    const ctx = createMockCtx() as any
    const mirror = createAnySearchMirror(ctx)
    const rendered = `AnySearch batch completed: 2 succeeded, 0 failed.

Each item is an independent HTTP request with independent quota and rate-limit evaluation.

## 1. first query

Request ID: req-1

Sources:

- [First](https://first.example.com) — First snippet

## 2. second query

Request ID: req-2

Sources:

- [Second](https://second.example.com) — Second snippet

Cite relevant source URLs as markdown links in the answer.`

    ctx.emit('session/event', { id: 's2' }, {
      type: 'tool/call',
      data: {
        name: 'anysearch_batch_search',
        callId: 'call-batch',
        arguments: {
          items: [
            { query: 'first query', zone: 'CN' },
            { query: 'second query', zone: 'Intl', maxResults: 3 },
          ],
        },
      },
    })
    ctx.emit('session/event', { id: 's2' }, {
      type: 'tool/result',
      data: {
        message: {
          source: { callId: 'call-batch' },
          content: [{
            type: 'tool-result',
            content: [{ type: 'text', text: rendered }],
          }],
        },
      },
    })

    const batches = mirror.get('s2')
    expect(batches).toHaveLength(2)
    expect(batches[0].order).toBe(1)
    expect(batches[0].query).toBe('first query')
    expect(batches[0].payload).toEqual({ query: 'first query', zone: 'CN' })
    expect(batches[1].order).toBe(2)
    expect(batches[1].query).toBe('second query')
    expect(batches[1].payload).toEqual({ query: 'second query', zone: 'Intl', maxResults: 3 })
  })
})
