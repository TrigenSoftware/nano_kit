import {
  describe,
  it,
  expect
} from 'vitest'
import {
  link,
  meta,
  script
} from '@nano_kit/router'
import {
  escapeHtml,
  headDescriptorToHtml
} from './utils.js'

describe('ssr', () => {
  describe('renderer', () => {
    describe('utils', () => {
      describe('escapeHtml', () => {
        it('should escape html special characters', () => {
          expect(escapeHtml('Tom & "Jerry" <3 >:)')).toBe('Tom &amp; &quot;Jerry&quot; &lt;3 &gt;:)')
        })

        it('should keep other characters as is', () => {
          expect(escapeHtml("it's fine/ok?")).toBe("it's fine/ok?")
        })
      })

      describe('headDescriptorToHtml', () => {
        it('should escape attribute values', () => {
          expect(headDescriptorToHtml(meta({
            name: 'description',
            content: 'Tom & "Jerry" <3'
          }))).toBe('<meta name="description" content="Tom &amp; &quot;Jerry&quot; &lt;3" />')
        })

        it('should escape reactive attribute values', () => {
          expect(headDescriptorToHtml(link({
            rel: 'canonical',
            href: () => '/search?q=<a>&b="c"'
          }))).toBe('<link rel="canonical" href="/search?q=&lt;a&gt;&amp;b=&quot;c&quot;" />')
        })

        it('should skip empty attribute values', () => {
          expect(headDescriptorToHtml(meta({
            name: 'description',
            content: null
          }))).toBe('<meta name="description" />')
        })

        it('should insert script code as is', () => {
          expect(headDescriptorToHtml(script({
            type: 'application/ld+json',
            code: '{"a":"<b>"}'
          }))).toBe('<script type="application/ld+json" />{"a":"<b>"}</script>')
        })
      })
    })
  })
})
