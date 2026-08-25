import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import { composeStories } from '@nanoviews/storybook'
import {
  render,
  screen
} from '@nanoviews/testing-library'
import {
  type WritableSignal,
  signal,
  computed,
  effect,
  untracked,
  isWritable,
  record
} from 'kida'
import {
  ul,
  li
} from '../elements/elements.js'
import { fragment } from '../elements/fragment.js'
import {
  trackById,
  as_,
  for_
} from './for.js'
import * as Stories from './for.stories.js'

const {
  StaticValue,
  ReactiveValue,
  EntitiesValue
} = composeStories(Stories)

interface Player {
  id: number
  name: string
}

function createPlayer(id: number): Player {
  return {
    id,
    name: String(id)
  }
}

// Deterministic, so a failure prints a seed and a step that reproduce it
function createRandom(seed: number) {
  return () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
}

describe('nanoviews', () => {
  describe('flow', () => {
    describe('for', () => {
      it('should handle static array', () => {
        const { container } = render(StaticValue())

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>Larl</li><li>Collapse</li><li>Mira</li><li>Miposhka</li></ul></div>')
      })

      it('should handle reactive array', () => {
        const items = signal([
          'Yatoro',
          'Larl',
          'Collapse',
          'Mira',
          'Miposhka'
        ])
        const { container } = render(ReactiveValue({
          items
        }))

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>Larl</li><li>Collapse</li><li>Mira</li><li>Miposhka</li></ul></div>')

        items([
          'Satanic',
          'Larl',
          'Collapse',
          'Rue',
          'Miposhka'
        ])

        expect(container.innerHTML).toBe('<div><ul><li>Satanic</li><li>Larl</li><li>Collapse</li><li>Rue</li><li>Miposhka</li></ul></div>')
      })

      it('should render placeholder', () => {
        const items = signal([
          'Yatoro',
          'Larl',
          'Collapse',
          'Mira',
          'Miposhka'
        ])
        const { container } = render(ReactiveValue({
          items
        }))

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>Larl</li><li>Collapse</li><li>Mira</li><li>Miposhka</li></ul></div>')

        items([])

        expect(container.innerHTML).toBe('<div><ul><li>No items</li></ul></div>')
      })

      it('should not recreate nodes', () => {
        const items = signal([
          'Satanic',
          'Larl',
          'Collapse',
          'Rue',
          'Miposhka'
        ])
        const { container } = render(ReactiveValue({
          items
        }))

        expect(container.innerHTML).toBe('<div><ul><li>Satanic</li><li>Larl</li><li>Collapse</li><li>Rue</li><li>Miposhka</li></ul></div>')

        const listItems = [
          screen.getByText('Satanic'),
          screen.getByText('Larl'),
          screen.getByText('Collapse'),
          screen.getByText('Rue'),
          screen.getByText('Miposhka')
        ]

        items([
          'Satanic',
          'Larl',
          'Malik',
          'Rue',
          'Miposhka'
        ])

        expect(container.innerHTML).toBe('<div><ul><li>Satanic</li><li>Larl</li><li>Malik</li><li>Rue</li><li>Miposhka</li></ul></div>')

        ;[
          screen.getByText('Satanic'),
          screen.getByText('Larl'),
          screen.getByText('Malik'),
          screen.getByText('Rue'),
          screen.getByText('Miposhka')
        ].forEach((item, index) => {
          expect(item).toBe(listItems[index])
        })
      })

      it('should swap nodes', () => {
        const items = signal([
          {
            id: 1,
            name: 'Satanic'
          },
          {
            id: 2,
            name: 'Larl'
          }
        ])
        const onEffect = vi.fn()
        const { container } = render(EntitiesValue({
          onEffect,
          items
        }))

        expect(container.innerHTML).toBe('<div><ul><li>Satanic</li><li>Larl</li></ul></div>')

        expect(onEffect.mock.calls).toEqual([['Satanic'], ['Larl']])
        onEffect.mock.calls.length = 0

        const listItems = [screen.getByText('Satanic'), screen.getByText('Larl')]

        items([
          {
            id: 0,
            name: 'Yatoro'
          },
          {
            id: 2,
            name: 'Larl'
          }
        ])

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>Larl</li></ul></div>')

        expect(onEffect.mock.calls).toEqual([['Yatoro']])
        onEffect.mock.calls.length = 0

        expect(listItems[0]).not.toBe(screen.queryByText('Satanic'))
        expect(listItems[1]).toBe(screen.getByText('Larl'))
      })

      it('should reorder nodes', () => {
        const items = signal([
          {
            id: 1,
            name: 'Satanic'
          },
          {
            id: 2,
            name: 'Larl'
          },
          {
            id: 3,
            name: 'Collapse'
          },
          {
            id: 4,
            name: 'Rue'
          },
          {
            id: 5,
            name: 'Miposhka'
          }
        ])
        const onEffect = vi.fn()
        const { container } = render(EntitiesValue({
          onEffect,
          items
        }))

        expect(container.innerHTML).toBe('<div><ul><li>Satanic</li><li>Larl</li><li>Collapse</li><li>Rue</li><li>Miposhka</li></ul></div>')

        expect(onEffect.mock.calls).toEqual([
          ['Satanic'],
          ['Larl'],
          ['Collapse'],
          ['Rue'],
          ['Miposhka']
        ])
        onEffect.mock.calls.length = 0

        const listItems = [
          screen.getByText('Satanic'),
          screen.getByText('Larl'),
          screen.getByText('Collapse'),
          screen.getByText('Rue'),
          screen.getByText('Miposhka')
        ]

        items([
          {
            id: 5,
            name: 'Miposhka'
          },
          {
            id: 4,
            name: 'Rue'
          },
          {
            id: 3,
            name: 'Collapse'
          },
          {
            id: 2,
            name: 'Larl'
          },
          {
            id: 1,
            name: 'Satanic'
          }
        ])

        expect(container.innerHTML).toBe('<div><ul><li>Miposhka</li><li>Rue</li><li>Collapse</li><li>Larl</li><li>Satanic</li></ul></div>')

        expect(onEffect.mock.calls).toEqual([])
        onEffect.mock.calls.length = 0

        ;[
          screen.getByText('Satanic'),
          screen.getByText('Larl'),
          screen.getByText('Collapse'),
          screen.getByText('Rue'),
          screen.getByText('Miposhka')
        ].forEach((item, index) => {
          expect(item).toBe(listItems[index])
        })

        items([
          {
            id: 5,
            name: 'Miposhka'
          },
          {
            id: 4,
            name: 'Rue'
          },
          {
            id: 3,
            name: 'Collapse'
          },
          {
            id: 2,
            name: 'Larl'
          },
          {
            id: 0,
            name: 'Yatoro'
          }
        ])

        expect(container.innerHTML).toBe('<div><ul><li>Miposhka</li><li>Rue</li><li>Collapse</li><li>Larl</li><li>Yatoro</li></ul></div>')

        expect(onEffect.mock.calls).toEqual([['Yatoro']])

        expect(screen.getByText('Larl')).toBe(listItems[1])
        expect(screen.getByText('Collapse')).toBe(listItems[2])
        expect(screen.getByText('Rue')).toBe(listItems[3])
        expect(screen.getByText('Miposhka')).toBe(listItems[4])
      })

      it('should insert a node before a row that rendered nothing', () => {
        const items = signal([
          {
            id: 1,
            name: 'Yatoro'
          },
          {
            id: 3,
            name: null
          },
          {
            id: 4,
            name: 'Larl'
          }
        ])
        const { container } = render(() => ul()(
          for_(items, trackById)(
            (item) => {
              const { $name } = record(item)

              return $name() ? li()($name) : null
            }
          )
        ))

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>Larl</li></ul></div>')

        items([
          {
            id: 1,
            name: 'Yatoro'
          },
          {
            id: 2,
            name: 'Collapse'
          },
          {
            id: 3,
            name: null
          },
          {
            id: 4,
            name: 'Larl'
          }
        ])

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>Collapse</li><li>Larl</li></ul></div>')
      })

      it('should move a multi node row across a row that rendered nothing', () => {
        const items = signal([
          {
            id: 1,
            name: null
          },
          {
            id: 2,
            name: 'Larl'
          },
          {
            id: 3,
            name: 'Yatoro'
          }
        ])
        const { container } = render(() => ul()(
          for_(items, trackById)(
            (item) => {
              const { $name } = record(item)

              return $name() ? fragment(li()($name), li()('*')) : null
            }
          )
        ))

        expect(container.innerHTML).toBe('<div><ul><li>Larl</li><li>*</li><li>Yatoro</li><li>*</li></ul></div>')

        items([
          {
            id: 3,
            name: 'Yatoro'
          },
          {
            id: 1,
            name: null
          },
          {
            id: 2,
            name: 'Larl'
          }
        ])

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>*</li><li>Larl</li><li>*</li></ul></div>')
      })

      it('should write a row back into the items array', () => {
        const items = signal([
          {
            id: 1,
            name: 'Yatoro'
          },
          {
            id: 2,
            name: 'Larl'
          }
        ])
        const names: WritableSignal<string>[] = []
        const { container } = render(() => ul()(
          for_(items, trackById)(
            (item) => {
              const { $name } = record(item)

              names.push($name)

              return li()($name)
            }
          )
        ))

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>Larl</li></ul></div>')

        names[1]('Collapse')

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>Collapse</li></ul></div>')
        expect(items()).toEqual([
          {
            id: 1,
            name: 'Yatoro'
          },
          {
            id: 2,
            name: 'Collapse'
          }
        ])
      })

      it('should write a row back at its current index after a reorder', () => {
        const items = signal([
          {
            id: 1,
            name: 'Yatoro'
          },
          {
            id: 2,
            name: 'Larl'
          },
          {
            id: 3,
            name: 'Collapse'
          }
        ])
        const rows: WritableSignal<Player>[] = []
        const { container } = render(() => ul()(
          for_(items, trackById)(
            (item) => {
              rows.push(item as WritableSignal<Player>)

              return li()(record(item).$name)
            }
          )
        ))

        items([
          {
            id: 3,
            name: 'Collapse'
          },
          {
            id: 2,
            name: 'Larl'
          },
          {
            id: 1,
            name: 'Yatoro'
          }
        ])

        expect(container.innerHTML).toBe('<div><ul><li>Collapse</li><li>Larl</li><li>Yatoro</li></ul></div>')

        // the row of id 1 now sits last, so its write must land there
        rows[0]({
          id: 1,
          name: 'Satanic'
        })

        expect(container.innerHTML).toBe('<div><ul><li>Collapse</li><li>Larl</li><li>Satanic</li></ul></div>')
        expect(items().map(({ id }) => id)).toEqual([3, 2, 1])
        expect(items()[2].name).toBe('Satanic')
      })

      it('should keep a read-only items array untouched when a row is written', () => {
        const source = signal([
          {
            id: 1,
            name: 'Yatoro'
          },
          {
            id: 2,
            name: 'Larl'
          }
        ])
        const items = computed(() => source())
        const rows: WritableSignal<Player>[] = []
        const { container } = render(() => ul()(
          for_(items, trackById)(
            (item) => {
              rows.push(item as WritableSignal<Player>)

              return li()(record(item).$name)
            }
          )
        ))

        rows[1]({
          id: 2,
          name: 'Collapse'
        })

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>Collapse</li></ul></div>')
        expect(source()[1].name).toBe('Larl')

        // the next update from the source replaces the local row value
        source([
          {
            id: 1,
            name: 'Yatoro'
          },
          {
            id: 2,
            name: 'Larl'
          }
        ])

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>Larl</li></ul></div>')
      })

      it('should hand out a read-only row for a read-only items array', () => {
        const source = signal([
          {
            id: 1,
            name: 'Yatoro'
          }
        ])
        const items = computed(() => source())
        let writable = true

        render(() => ul()(
          for_(items, trackById)(
            (item) => {
              writable = isWritable(item)

              return li()(record(item).$name)
            }
          )
        ))

        expect(writable).toBe(false)
      })

      it('should remove a run of rows from the end', () => {
        const items = signal([1, 2, 3, 4, 5])
        const destroyed: number[] = []
        const { container } = render(() => ul()(
          for_(items, id => id)(
            (item) => {
              const id = item()

              effect(() => () => destroyed.push(id))

              return li()(() => String(item()))
            }
          )
        ))

        expect(container.innerHTML).toBe('<div><ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul></div>')

        items([1, 2])

        expect(container.innerHTML).toBe('<div><ul><li>1</li><li>2</li></ul></div>')
        expect(destroyed).toEqual([3, 4, 5])
      })

      it('should remove a row from the middle', () => {
        const items = signal([1, 2, 3, 4, 5])
        const { container } = render(() => ul()(
          for_(items, id => id)(
            item => li()(() => String(item()))
          )
        ))
        const kept = [screen.getByText('1'), screen.getByText('5')]

        items([1, 2, 4, 5])

        expect(container.innerHTML).toBe('<div><ul><li>1</li><li>2</li><li>4</li><li>5</li></ul></div>')
        expect(screen.getByText('1')).toBe(kept[0])
        expect(screen.getByText('5')).toBe(kept[1])
      })

      it('should reverse a long list without recreating nodes', () => {
        const source = Array.from(
          {
            length: 30
          },
          (_, i) => i + 1
        )
        const items = signal(source)
        const { container } = render(() => ul()(
          for_(items, id => id)(
            item => li()(() => String(item()))
          )
        ))
        const nodes = source.map(id => screen.getByText(String(id)))

        items([...source].reverse())

        expect(container.innerHTML).toBe(`<div><ul>${[...source].reverse().map(id => `<li>${id}</li>`).join('')}</ul></div>`)

        source.forEach((id, index) => {
          expect(screen.getByText(String(id))).toBe(nodes[index])
        })
      })

      it('should store a function row value instead of calling it', () => {
        let calls = 0
        const first = () => {
          calls++

          return 'first'
        }
        const second = () => {
          calls++

          return 'second'
        }
        const items = signal([first, second])
        const { container } = render(() => ul()(
          for_(items, (_, index) => index)(
            item => li()(() => (item() === first ? 'Yatoro' : 'Larl'))
          )
        ))

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>Larl</li></ul></div>')

        // the reconcile pushes the new value into the row, and a value that
        // happens to be a function must be stored, not invoked as a reducer
        items([second, first])

        expect(container.innerHTML).toBe('<div><ul><li>Larl</li><li>Yatoro</li></ul></div>')

        items([first, second])

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>Larl</li></ul></div>')
        expect(calls).toBe(0)
      })

      it('should drop a write from a row removed out of the middle', () => {
        const items = signal([
          {
            id: 1,
            name: 'Yatoro'
          },
          {
            id: 2,
            name: 'Larl'
          },
          {
            id: 3,
            name: 'Collapse'
          }
        ])
        const rows: WritableSignal<Player>[] = []
        const { container } = render(() => ul()(
          for_(items, trackById)(
            (item) => {
              rows.push(item as WritableSignal<Player>)

              return li()(record(item).$name)
            }
          )
        ))

        items([
          {
            id: 1,
            name: 'Yatoro'
          },
          {
            id: 3,
            name: 'Collapse'
          }
        ])

        // whatever the removed row still holds - a debounce, a response -
        // fires only now, and must not land anywhere
        rows[1]({
          id: 2,
          name: 'Miposhka'
        })

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>Collapse</li></ul></div>')
        expect(items()).toEqual([
          {
            id: 1,
            name: 'Yatoro'
          },
          {
            id: 3,
            name: 'Collapse'
          }
        ])
      })

      it('should drop a write from a row removed off the end', () => {
        const items = signal([
          {
            id: 1,
            name: 'Yatoro'
          },
          {
            id: 2,
            name: 'Larl'
          },
          {
            id: 3,
            name: 'Collapse'
          }
        ])
        const rows: WritableSignal<Player>[] = []
        const { container } = render(() => ul()(
          for_(items, trackById)(
            (item) => {
              rows.push(item as WritableSignal<Player>)

              return li()(record(item).$name)
            }
          )
        ))

        items([
          {
            id: 1,
            name: 'Yatoro'
          }
        ])

        rows[2]({
          id: 3,
          name: 'Miposhka'
        })

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li></ul></div>')
        expect(items()).toEqual([
          {
            id: 1,
            name: 'Yatoro'
          }
        ])
      })

      it('should drop a write from a row whose key was reused by a new row', () => {
        const items = signal([
          {
            id: 1,
            name: 'Yatoro'
          }
        ])
        const rows: WritableSignal<Player>[] = []
        const { container } = render(() => ul()(
          for_(items, trackById)(
            (item) => {
              rows.push(item as WritableSignal<Player>)

              return li()(record(item).$name)
            }
          )
        ))

        // the list empties, so every row is torn down at once
        items([])
        // and the same key comes back on a row that is not the same row
        items([
          {
            id: 1,
            name: 'Larl'
          }
        ])

        rows[0]({
          id: 1,
          name: 'Miposhka'
        })

        expect(container.innerHTML).toBe('<div><ul><li>Larl</li></ul></div>')
        expect(items()).toEqual([
          {
            id: 1,
            name: 'Larl'
          }
        ])
      })

      it('should render a write made by a row created during an update', () => {
        const items = signal([
          {
            id: 1,
            name: 'Yatoro'
          }
        ])
        const { container } = render(() => ul()(
          for_(items, trackById)(
            (item) => {
              const { $name } = record(item)

              // the row normalises its own value, so the write reaches the
              // items array from a row effect the update itself started
              effect(() => {
                const name = $name()

                if (name !== name.trim()) {
                  $name(name.trim())
                }
              })

              return li()($name)
            }
          )
        ))

        items([
          {
            id: 1,
            name: 'Yatoro'
          },
          {
            id: 2,
            name: '  Larl  '
          }
        ])

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>Larl</li></ul></div>')
      })

      it('should render a write made by a row that survived an update', () => {
        const items = signal([
          {
            id: 1,
            name: 'Yatoro'
          }
        ])
        const { container } = render(() => ul()(
          for_(items, trackById)(
            (item) => {
              const { $name } = record(item)

              effect(() => {
                const name = $name()

                if (name !== name.trim()) {
                  $name(name.trim())
                }
              })

              return li()($name)
            }
          )
        ))

        // the row is not created here - the update only rewrites its value,
        // and the effect that answers runs on the same reconcile
        items([
          {
            id: 1,
            name: '  Larl  '
          }
        ])

        expect(container.innerHTML).toBe('<div><ul><li>Larl</li></ul></div>')
      })

      it('should render a write made by a row while it renders', () => {
        const items = signal([
          {
            id: 1,
            name: 'Yatoro'
          }
        ])
        const { container } = render(() => ul()(
          for_(items, trackById)(
            (item) => {
              const { $name } = record(item)
              const name = untracked($name)

              // the row normalises what it was handed from its own body, so
              // the write reaches the array from inside the update's render
              if (name !== name.trim()) {
                $name(name.trim())
              }

              return li()($name)
            }
          )
        ))

        items([
          {
            id: 1,
            name: 'Yatoro'
          },
          {
            id: 2,
            name: '  Larl  '
          }
        ])

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li><li>Larl</li></ul></div>')
        expect(untracked(items)).toEqual([
          {
            id: 1,
            name: 'Yatoro'
          },
          {
            id: 2,
            name: 'Larl'
          }
        ])
      })

      it('should render a write made by a row the placeholder gave way to', () => {
        const items = signal<Player[]>([])
        const { container } = render(() => ul()(
          for_(items, trackById)(
            (item) => {
              const { $name } = record(item)

              effect(() => {
                const name = $name()

                if (name !== name.trim()) {
                  $name(name.trim())
                }
              })

              return li()($name)
            },
            () => li()('nobody')
          )
        ))

        // the row is born on the swap out of the placeholder, not on a
        // reconcile: a different path into the same running swapper
        items([
          {
            id: 1,
            name: '  Larl  '
          }
        ])

        expect(container.innerHTML).toBe('<div><ul><li>Larl</li></ul></div>')
        expect(untracked(items)).toEqual([
          {
            id: 1,
            name: 'Larl'
          }
        ])
      })

      it('should keep the placeholder across a write that leaves the array empty', () => {
        const items = signal<Player[]>([])
        const runs: number[] = []
        const { container } = render(() => ul()(
          for_(items, trackById)(
            item => li()(record(item).$name),
            () => {
              // the placeholder is rendered once: a write that leaves the
              // array empty must not tear it down and build it again
              effect(() => {
                runs.push(runs.length)
              })

              return li()('nobody')
            }
          )
        ))

        expect(runs).toEqual([0])

        items([])

        expect(container.innerHTML).toBe('<div><ul><li>nobody</li></ul></div>')
        expect(runs).toEqual([0])
      })

      it('should render the placeholder for an absent array', () => {
        const items = signal<Player[] | undefined>(undefined)
        const { container } = render(() => ul()(
          for_(items, trackById)(
            item => li()(record(item).$name),
            () => li()('nobody')
          )
        ))

        expect(container.innerHTML).toBe('<div><ul><li>nobody</li></ul></div>')

        items([
          {
            id: 1,
            name: 'Yatoro'
          }
        ])

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro</li></ul></div>')

        // no array is the same emptiness as an empty one
        items(undefined)

        expect(container.innerHTML).toBe('<div><ul><li>nobody</li></ul></div>')

        items([])

        expect(container.innerHTML).toBe('<div><ul><li>nobody</li></ul></div>')
      })

      it('should hand the tracking key to the row', () => {
        const items = signal([
          {
            id: 'a',
            name: 'Yatoro'
          },
          {
            id: 'b',
            name: 'Larl'
          }
        ])
        const { container } = render(() => ul()(
          for_(items, trackById)(
            ($player, $index, key) => li()(key, ':', () => $player().name, ':', $index)
          )
        ))

        expect(container.innerHTML).toBe('<div><ul><li>a:Yatoro:0</li><li>b:Larl:1</li></ul></div>')

        // The key is the row's own: it stays with the row wherever the row
        // goes, while the index follows the position
        items([
          {
            id: 'b',
            name: 'Larl'
          },
          {
            id: 'a',
            name: 'Yatoro'
          }
        ])

        expect(container.innerHTML).toBe('<div><ul><li>b:Larl:0</li><li>a:Yatoro:1</li></ul></div>')
      })

      it('should hand the index as the key when there is no tracker', () => {
        const items = signal(['Yatoro', 'Larl'])
        const { container } = render(() => ul()(
          for_(items)(
            ($player, $index, key) => li()(key, ':', $player, ':', $index)
          )
        ))

        expect(container.innerHTML).toBe('<div><ul><li>0:Yatoro:0</li><li>1:Larl:1</li></ul></div>')
      })

      it('should hand the index as the key of a static array row', () => {
        const { container } = render(() => ul()(
          for_(['Yatoro', 'Larl'])(
            (player, index, key) => li()(key, ':', player, ':', index)
          )
        ))

        expect(container.innerHTML).toBe('<div><ul><li>0:Yatoro:0</li><li>1:Larl:1</li></ul></div>')
      })

      it('should carry the tracking key through `as_`', () => {
        const items = signal([
          {
            id: 'a',
            name: 'Yatoro'
          },
          {
            id: 'b',
            name: 'Larl'
          }
        ])
        const { container } = render(() => ul()(
          for_(items, trackById)(
            as_(record, ($player, $index, key) => li()(key, ':', $player.$name, ':', $index))
          )
        ))

        expect(container.innerHTML).toBe('<div><ul><li>a:Yatoro:0</li><li>b:Larl:1</li></ul></div>')
      })

      it('should hand the row through a transform with `as_`', () => {
        const items = signal([
          {
            id: 1,
            name: 'Yatoro'
          },
          {
            id: 2,
            name: 'Larl'
          }
        ])
        const { container } = render(() => ul()(
          for_(items, trackById)(
            as_(record, ($player, $index) => li()($player.$name, ':', $index))
          )
        ))

        expect(container.innerHTML).toBe('<div><ul><li>Yatoro:0</li><li>Larl:1</li></ul></div>')

        // the transformed row is still the row: a write reaches the array
        untracked(items)[0].name = 'x'
        items([
          {
            id: 1,
            name: 'Collapse'
          },
          {
            id: 2,
            name: 'Larl'
          }
        ])

        expect(container.innerHTML).toBe('<div><ul><li>Collapse:0</li><li>Larl:1</li></ul></div>')
      })

      it('should keep a row written through `as_` writable', () => {
        const items = signal([
          {
            id: 1,
            name: '  Larl  '
          }
        ])

        render(() => ul()(
          for_(items, trackById)(
            as_(record, ($player) => {
              const name = untracked($player.$name)

              if (name !== name.trim()) {
                $player.$name(name.trim())
              }

              return li()($player.$name)
            })
          )
        ))

        expect(untracked(items)).toEqual([
          {
            id: 1,
            name: 'Larl'
          }
        ])
      })

      describe('fuzz', () => {
        // A named test pins a shape someone thought of; these walk sequences
        // nobody did. Both invariants are checked after every step: the rows
        // stand in the array's order, and every row that is on screen has had
        // its effect run - a row rendered but never started keeps the right
        // DOM and silently answers nothing
        it.each([1, 7, 42, 1234])(
          'should render and start every row, seed %i',
          (seed) => {
            const steps = 150
            const random = createRandom(seed)
            const pick = (n: number) => Math.floor(random() * n)
            const started = new Set<number>()
            const items = signal<Player[]>([])
            const { container } = render(() => ul()(
              for_(items, trackById)(
                (item) => {
                  const { id } = untracked(item)

                  effect(() => {
                    started.add(id)
                  })

                  return li()(String(id))
                },
                () => li()('nobody')
              )
            ))
            let model: Player[] = []
            let nextId = 0

            for (let step = 0; step < steps; step++) {
              const next = model.slice()
              const operation = pick(6)

              if (operation === 0) {
                next.splice(pick(next.length + 1), 0, createPlayer(nextId++))
              } else if (operation === 1) {
                const at = pick(next.length + 1)

                for (let count = 1 + pick(3); count--;) {
                  next.splice(at, 0, createPlayer(nextId++))
                }
              } else if (operation === 2 && next.length) {
                next.splice(pick(next.length), 1 + pick(3))
              } else if (operation === 3 && next.length > 1) {
                const run = next.splice(pick(next.length), 1 + pick(3))

                next.splice(pick(next.length + 1), 0, ...run)
              } else if (operation === 4 && next.length > 1) {
                next.reverse()
              } else {
                if (next.length) {
                  next.splice(pick(next.length), 1 + pick(2))
                }

                next.splice(pick(next.length + 1), 0, createPlayer(nextId++))
              }

              model = next
              items(model.map(player => ({
                ...player
              })))

              const where = `seed ${seed}, step ${step}`
              const ids = model.map(player => player.id)

              if (ids.length) {
                expect([...container.querySelectorAll('li')].map(node => Number(node.textContent)), where).toEqual(ids)
              } else {
                expect(container.innerHTML, where).toBe('<div><ul><li>nobody</li></ul></div>')
              }

              expect(ids.filter(id => !started.has(id)), where).toEqual([])
            }
          }
        )
      })
    })
  })
})
