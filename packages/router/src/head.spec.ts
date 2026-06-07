import {
  describe,
  it,
  expect,
  beforeEach
} from 'vitest'
import {
  signal,
  computed
} from '@nano_kit/store'
import {
  type Dir,
  syncHead,
  title,
  lang,
  dir,
  link,
  meta,
  script
} from './head.js'

describe('router', () => {
  describe('head', () => {
    describe('syncHead', () => {
      describe('title', () => {
        beforeEach(() => {
          document.title = ''
        })

        it('should not change existing title', () => {
          document.title = 'Existing Title'

          const stop = syncHead(() => ({
            default: null,
            Head$: () => [title('Existing Title')]
          }))

          expect(document.title).toBe('Existing Title')

          stop()
        })

        it('should apply new title', () => {
          expect(document.title).toBe('')

          const stop = syncHead(() => ({
            default: null,
            Head$: () => [title('New Title')]
          }))

          expect(document.title).toBe('New Title')

          stop()
        })

        it('should update title on page change', () => {
          expect(document.title).toBe('')

          const $page = signal({
            default: null,
            Head$: () => [title('Initial Title')]
          })
          const stop = syncHead($page)

          expect(document.title).toBe('Initial Title')

          $page({
            default: null,
            Head$: () => [title('Updated Title')]
          })

          expect(document.title).toBe('Updated Title')

          stop()
        })

        it('should keep title when duplicate title descriptors change', () => {
          expect(document.title).toBe('')

          const $page = signal({
            default: null,
            Head$: () => [
              title('b'),
              title('a')
            ]
          })
          const stop = syncHead($page)

          expect(document.title).toBe('b')

          $page({
            default: null,
            Head$: () => [
              title('c'),
              title('a')
            ]
          })

          expect(document.title).toBe('c')

          stop()
        })

        it('should update title signal', () => {
          expect(document.title).toBe('')

          const $title = signal('Foo')
          const $page = signal({
            default: null,
            Head$: () => [title($title)]
          })
          const stop = syncHead($page)

          expect(document.title).toBe('Foo')

          $title('Bar')

          expect(document.title).toBe('Bar')

          stop()
        })

        it('should update title on page and signal change', () => {
          expect(document.title).toBe('')

          const $title = signal('Foo')
          const $page = signal({
            default: null,
            Head$: () => [title($title)]
          })
          const stop = syncHead($page)

          expect(document.title).toBe('Foo')

          $title('Bar')

          expect(document.title).toBe('Bar')

          $page({
            default: null,
            Head$: () => []
          })

          expect(document.title).toBe('')

          $page({
            default: null,
            Head$: () => [title('Baz')]
          })

          expect(document.title).toBe('Baz')

          stop()
        })
      })

      describe('lang', () => {
        beforeEach(() => {
          document.documentElement.lang = ''
        })

        it('should not change existing lang', () => {
          document.documentElement.lang = 'ka'

          const stop = syncHead(() => ({
            default: null,
            Head$: () => [lang('ka')]
          }))

          expect(document.documentElement.lang).toBe('ka')

          stop()
        })

        it('should apply new lang', () => {
          expect(document.documentElement.lang).toBe('')

          const stop = syncHead(() => ({
            default: null,
            Head$: () => [lang('en')]
          }))

          expect(document.documentElement.lang).toBe('en')

          stop()
        })

        it('should update lang on page change', () => {
          expect(document.documentElement.lang).toBe('')

          const $page = signal({
            default: null,
            Head$: () => [lang('en')]
          })
          const stop = syncHead($page)

          expect(document.documentElement.lang).toBe('en')

          $page({
            default: null,
            Head$: () => [lang('ka')]
          })

          expect(document.documentElement.lang).toBe('ka')

          stop()
        })

        it('should update lang signal', () => {
          expect(document.documentElement.lang).toBe('')

          const $lang = signal('en')
          const $page = signal({
            default: null,
            Head$: () => [lang($lang)]
          })
          const stop = syncHead($page)

          expect(document.documentElement.lang).toBe('en')

          $lang('fr')

          expect(document.documentElement.lang).toBe('fr')

          stop()
        })

        it('should update title on page and signal change', () => {
          expect(document.documentElement.lang).toBe('')

          const $lang = signal('en')
          const $page = signal({
            default: null,
            Head$: () => [lang($lang)]
          })
          const stop = syncHead($page)

          expect(document.documentElement.lang).toBe('en')

          $lang('fr')

          expect(document.documentElement.lang).toBe('fr')

          $page({
            default: null,
            Head$: () => []
          })

          expect(document.documentElement.lang).toBe('')

          $page({
            default: null,
            Head$: () => [lang('ru')]
          })

          expect(document.documentElement.lang).toBe('ru')

          stop()
        })
      })

      describe('dir', () => {
        beforeEach(() => {
          document.documentElement.dir = ''
        })

        it('should not change existing dir', () => {
          document.documentElement.dir = 'rtl'

          const stop = syncHead(() => ({
            default: null,
            Head$: () => [dir('rtl')]
          }))

          expect(document.documentElement.dir).toBe('rtl')

          stop()
        })

        it('should apply new dir', () => {
          expect(document.documentElement.dir).toBe('')

          const stop = syncHead(() => ({
            default: null,
            Head$: () => [dir('ltr')]
          }))

          expect(document.documentElement.dir).toBe('ltr')

          stop()
        })

        it('should update dir on page change', () => {
          expect(document.documentElement.dir).toBe('')

          const $page = signal({
            default: null,
            Head$: () => [dir('ltr')]
          })
          const stop = syncHead($page)

          expect(document.documentElement.dir).toBe('ltr')

          $page({
            default: null,
            Head$: () => [dir('rtl')]
          })

          expect(document.documentElement.dir).toBe('rtl')

          stop()
        })

        it('should update dir signal', () => {
          expect(document.documentElement.dir).toBe('')

          const $dir = signal<Dir>('ltr')
          const $page = signal({
            default: null,
            Head$: () => [dir($dir)]
          })
          const stop = syncHead($page)

          expect(document.documentElement.dir).toBe('ltr')

          $dir('rtl')

          expect(document.documentElement.dir).toBe('rtl')

          stop()
        })

        it('should update dir on page and signal change', () => {
          expect(document.documentElement.dir).toBe('')

          const $dir = signal<Dir>('ltr')
          const $page = signal({
            default: null,
            Head$: () => [dir($dir)]
          })
          const stop = syncHead($page)

          expect(document.documentElement.dir).toBe('ltr')

          $dir('rtl')

          expect(document.documentElement.dir).toBe('rtl')

          $page({
            default: null,
            Head$: () => []
          })

          expect(document.documentElement.dir).toBe('')

          $page({
            default: null,
            Head$: () => [dir('auto')]
          })

          expect(document.documentElement.dir).toBe('auto')

          stop()
        })
      })

      describe('link', () => {
        beforeEach(() => {
          document.head.textContent = ''
        })

        it('should add link tag', () => {
          const stop = syncHead(() => ({
            default: null,
            Head$: () => [link({
              rel: 'prefetch',
              href: 'style.css'
            })]
          }))

          expect(document.head.innerHTML).toBe('<link rel="prefetch" href="style.css">')

          stop()
        })

        it('should update link tag on page change', () => {
          const $page = signal({
            default: null,
            Head$: () => [link({
              rel: 'prefetch',
              href: 'style.css'
            })]
          })
          const stop = syncHead($page)

          expect(document.head.innerHTML).toBe('<link rel="prefetch" href="style.css">')

          $page({
            default: null,
            Head$: () => [link({
              rel: 'preload',
              href: 'script.js'
            })]
          })

          expect(document.head.innerHTML).toBe('<link rel="preload" href="script.js">')

          stop()
        })

        it('should update link tag on signal change', () => {
          const $href = signal('style.css')
          const $page = signal({
            default: null,
            Head$: () => [link({
              rel: 'prefetch',
              href: $href
            })]
          })
          const stop = syncHead($page)

          expect(document.head.innerHTML).toBe('<link rel="prefetch" href="style.css">')

          $href('script.js')

          expect(document.head.innerHTML).toBe('<link rel="prefetch" href="script.js">')

          stop()
        })

        it('should update link tag on page and signal change', () => {
          const $href = signal('style.css')
          const $page = signal({
            default: null,
            Head$: () => [link({
              rel: 'prefetch',
              href: $href
            })]
          })
          const stop = syncHead($page)

          expect(document.head.innerHTML).toBe('<link rel="prefetch" href="style.css">')

          $href('script.js')

          expect(document.head.innerHTML).toBe('<link rel="prefetch" href="script.js">')

          $page({
            default: null,
            Head$: () => []
          })

          expect(document.head.innerHTML).toBe('')

          $page({
            default: null,
            Head$: () => [link({
              rel: 'preload',
              href: 'image.png'
            })]
          })

          expect(document.head.innerHTML).toBe('<link rel="preload" href="image.png">')

          stop()
        })

        it('should hydrate existing link tag', () => {
          document.head.innerHTML = '<link rel="prefetch" href="style.css">'

          const $link = signal('style.css')
          const $page = signal({
            default: null,
            Head$: () => [link({
              rel: 'prefetch',
              href: $link
            })]
          })
          const stop = syncHead($page)

          expect(document.head.innerHTML).toBe('<link rel="prefetch" href="style.css">')

          $link('script.js')

          expect(document.head.innerHTML).toBe('<link rel="prefetch" href="script.js">')

          stop()
        })
      })

      describe('meta', () => {
        beforeEach(() => {
          document.head.textContent = ''
        })

        it('should add meta tag', () => {
          const stop = syncHead(() => ({
            default: null,
            Head$: () => [meta({
              name: 'description',
              content: 'Hello world'
            })]
          }))

          expect(document.head.innerHTML).toBe('<meta name="description" content="Hello world">')

          stop()
        })

        it('should update meta tag on page change', () => {
          const $page = signal({
            default: null,
            Head$: () => [meta({
              name: 'description',
              content: 'Hello world'
            })]
          })
          const stop = syncHead($page)

          expect(document.head.innerHTML).toBe('<meta name="description" content="Hello world">')

          $page({
            default: null,
            Head$: () => [meta({
              name: 'description',
              content: 'Updated description'
            })]
          })

          expect(document.head.innerHTML).toBe('<meta name="description" content="Updated description">')

          stop()
        })

        it('should update meta tag on signal change', () => {
          const $content = signal('Hello world')
          const $page = signal({
            default: null,
            Head$: () => [meta({
              name: 'description',
              content: $content
            })]
          })
          const stop = syncHead($page)

          expect(document.head.innerHTML).toBe('<meta name="description" content="Hello world">')

          $content('Updated description')

          expect(document.head.innerHTML).toBe('<meta name="description" content="Updated description">')

          stop()
        })

        it('should update meta tag on page and signal change', () => {
          const $content = signal('Hello world')
          const $page = signal({
            default: null,
            Head$: () => [meta({
              name: 'description',
              content: $content
            })]
          })
          const stop = syncHead($page)

          expect(document.head.innerHTML).toBe('<meta name="description" content="Hello world">')

          $content('Updated description')

          expect(document.head.innerHTML).toBe('<meta name="description" content="Updated description">')

          $page({
            default: null,
            Head$: () => []
          })

          expect(document.head.innerHTML).toBe('')

          $page({
            default: null,
            Head$: () => [meta({
              name: 'keywords',
              content: 'foo, bar'
            })]
          })

          expect(document.head.innerHTML).toBe('<meta name="keywords" content="foo, bar">')

          stop()
        })

        it('should hydrate existing meta tag', () => {
          document.head.innerHTML = '<meta name="description" content="Hello world">'

          const $content = signal('Hello world')
          const $page = signal({
            default: null,
            Head$: () => [meta({
              name: 'description',
              content: $content
            })]
          })
          const stop = syncHead($page)

          expect(document.head.innerHTML).toBe('<meta name="description" content="Hello world">')

          $content('Updated description')

          expect(document.head.innerHTML).toBe('<meta name="description" content="Updated description">')

          stop()
        })
      })

      describe('script', () => {
        beforeEach(() => {
          document.head.textContent = ''
        })

        it('should add script tag', () => {
          const stop = syncHead(() => ({
            default: null,
            Head$: () => [script({
              src: 'app.js',
              defer: true
            })]
          }))

          expect(document.head.innerHTML).toBe('<script src="app.js" defer="true"></script>')

          stop()
        })

        it('should update script tag on page change', () => {
          const $page = signal({
            default: null,
            Head$: () => [script({
              src: 'app.js',
              defer: true
            })]
          })
          const stop = syncHead($page)

          expect(document.head.innerHTML).toBe('<script src="app.js" defer="true"></script>')

          $page({
            default: null,
            Head$: () => [script({
              src: 'vendor.js',
              async: true
            })]
          })

          expect(document.head.innerHTML).toBe('<script src="vendor.js" async="true"></script>')

          stop()
        })

        it('should remove script tag on page change', () => {
          const $page = signal({
            default: null,
            Head$: () => [script({
              src: 'app.js'
            })]
          })
          const stop = syncHead($page)

          expect(document.head.innerHTML).toBe('<script src="app.js"></script>')

          $page({
            default: null,
            Head$: () => []
          })

          expect(document.head.innerHTML).toBe('')

          stop()
        })

        it('should hydrate existing script tag', () => {
          document.head.innerHTML = '<script src="app.js"></script>'

          const $page = signal({
            default: null,
            Head$: () => [script({
              src: 'app.js'
            })]
          })
          const stop = syncHead($page)

          expect(document.head.innerHTML).toBe('<script src="app.js"></script>')

          $page({
            default: null,
            Head$: () => [script({
              src: 'vendor.js'
            })]
          })

          expect(document.head.innerHTML).toBe('<script src="vendor.js"></script>')

          stop()
        })

        describe('inline (code)', () => {
          it('should add inline script tag', () => {
            const stop = syncHead(() => ({
              default: null,
              Head$: () => [script({
                type: 'application/ld+json',
                code: '{"@context":"https://schema.org"}'
              })]
            }))

            expect(document.head.innerHTML).toBe('<script type="application/ld+json">{"@context":"https://schema.org"}</script>')

            stop()
          })

          it('should update inline script tag on page change', () => {
            const $page = signal({
              default: null,
              Head$: () => [script({
                type: 'application/ld+json',
                code: '{"@context":"https://schema.org","@type":"WebSite"}'
              })]
            })
            const stop = syncHead($page)

            expect(document.head.innerHTML).toBe('<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite"}</script>')

            $page({
              default: null,
              Head$: () => [script({
                type: 'application/ld+json',
                code: '{"@context":"https://schema.org","@type":"WebPage"}'
              })]
            })

            expect(document.head.innerHTML).toBe('<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage"}</script>')

            stop()
          })

          it('should remove inline script tag on page change', () => {
            const $page = signal({
              default: null,
              Head$: () => [script({
                type: 'application/ld+json',
                code: '{"@context":"https://schema.org"}'
              })]
            })
            const stop = syncHead($page)

            expect(document.head.innerHTML).toBe('<script type="application/ld+json">{"@context":"https://schema.org"}</script>')

            $page({
              default: null,
              Head$: () => []
            })

            expect(document.head.innerHTML).toBe('')

            stop()
          })

          it('should hydrate existing inline script tag', () => {
            document.head.innerHTML = '<script type="application/ld+json">{"@context":"https://schema.org"}</script>'

            const $page = signal({
              default: null,
              Head$: () => [script({
                type: 'application/ld+json',
                code: '{"@context":"https://schema.org"}'
              })]
            })
            const stop = syncHead($page)

            expect(document.head.innerHTML).toBe('<script type="application/ld+json">{"@context":"https://schema.org"}</script>')

            $page({
              default: null,
              Head$: () => [script({
                type: 'application/ld+json',
                code: '{"@context":"https://schema.org","@type":"WebPage"}'
              })]
            })

            expect(document.head.innerHTML).toBe('<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage"}</script>')

            stop()
          })
        })
      })

      it('should handle multiple head tags', () => {
        document.head.textContent = ''

        const homePage = {
          default: null,
          Head$: () => [
            meta({
              charSet: 'utf-8'
            }),
            title('Home'),
            link({
              rel: 'stylesheet',
              href: 'common.css'
            }),
            link({
              rel: 'stylesheet',
              href: 'home.css'
            }),
            script({
              src: 'home.js',
              type: 'module'
            })
          ]
        }
        const aboutPage = {
          default: null,
          Head$: () => [
            meta({
              charSet: 'utf-8'
            }),
            title('About'),
            link({
              rel: 'stylesheet',
              href: 'common.css'
            }),
            link({
              rel: 'stylesheet',
              href: 'about.css'
            }),
            script({
              src: 'about.js',
              type: 'module'
            })
          ]
        }
        const $messagesCount = signal(0)
        const chatPage = {
          default: null,
          Head$: () => [
            meta({
              charSet: 'utf-8'
            }),
            title(computed(() => `Messages count: ${$messagesCount()}`)),
            link({
              rel: 'stylesheet',
              href: 'common.css'
            }),
            link({
              rel: 'stylesheet',
              href: 'chat.css'
            }),
            script({
              src: 'chat.js',
              type: 'module'
            })
          ]
        }
        const $page = signal(homePage)
        const stop = syncHead($page)
        const metaCharset = document.head.querySelector('meta[charset]')
        const commonStyle = document.head.querySelector('link[rel="stylesheet"][href="common.css"]')

        expect(document.head.innerHTML).toBe(
          '<meta charset="utf-8">'
          + '<title>Home</title>'
          + '<link rel="stylesheet" href="common.css">'
          + '<link rel="stylesheet" href="home.css">'
          + '<script src="home.js" type="module"></script>'
        )

        $page(aboutPage)

        expect(document.head.innerHTML).toBe(
          '<meta charset="utf-8">'
          + '<title>About</title>'
          + '<link rel="stylesheet" href="common.css">'
          + '<link rel="stylesheet" href="about.css">'
          + '<script src="about.js" type="module"></script>'
        )

        expect(document.head.querySelector('meta[charset]')).toBe(metaCharset)
        expect(document.head.querySelector('link[rel="stylesheet"][href="common.css"]')).toBe(commonStyle)

        $page(homePage)

        expect(document.head.innerHTML).toBe(
          '<meta charset="utf-8">'
          + '<title>Home</title>'
          + '<link rel="stylesheet" href="common.css">'
          + '<link rel="stylesheet" href="home.css">'
          + '<script src="home.js" type="module"></script>'
        )

        expect(document.head.querySelector('meta[charset]')).toBe(metaCharset)
        expect(document.head.querySelector('link[rel="stylesheet"][href="common.css"]')).toBe(commonStyle)

        $page(chatPage)

        expect(document.head.innerHTML).toBe(
          '<meta charset="utf-8">'
          + '<title>Messages count: 0</title>'
          + '<link rel="stylesheet" href="common.css">'
          + '<link rel="stylesheet" href="chat.css">'
          + '<script src="chat.js" type="module"></script>'
        )

        expect(document.head.querySelector('meta[charset]')).toBe(metaCharset)
        expect(document.head.querySelector('link[rel="stylesheet"][href="common.css"]')).toBe(commonStyle)

        $messagesCount(42)

        expect(document.head.innerHTML).toBe(
          '<meta charset="utf-8">'
          + '<title>Messages count: 42</title>'
          + '<link rel="stylesheet" href="common.css">'
          + '<link rel="stylesheet" href="chat.css">'
          + '<script src="chat.js" type="module"></script>'
        )

        expect(document.head.querySelector('meta[charset]')).toBe(metaCharset)
        expect(document.head.querySelector('link[rel="stylesheet"][href="common.css"]')).toBe(commonStyle)

        stop()
      })
    })
  })
})
