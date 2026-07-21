import { Bench } from 'tinybench'
import * as signals from 'alien-signals-1'
import * as signals3 from 'alien-signals-3'
import * as agera from '../agera/dist/index.js' // 'agera'

const bench = new Bench({
  warmup: true,
  time: 1000
})

bench
  .add('alien-signals-1 / effectScope', () => {
    const $a = signals.signal(0)
    const $b = signals.signal(0)
    const destroy = signals.effectScope(() => {
      signals.effect(() => {
        $a()
      })
      signals.effect(() => {
        $a()
        $b()
      })
    })

    destroy()
  })
  .add('alien-signals-3 / effectScope', () => {
    const $a = signals3.signal(0)
    const $b = signals3.signal(0)
    const destroy = signals3.effectScope(() => {
      signals3.effect(() => {
        $a()
      })
      signals3.effect(() => {
        $a()
        $b()
      })
    })

    destroy()
  })
  .add('agera / effectScope', () => {
    const $a = agera.signal(0)
    const $b = agera.signal(0)
    const destroy = agera.effectScope(() => {
      agera.effect(() => {
        $a()
      })
      agera.effect(() => {
        $a()
        $b()
      })
    })

    destroy()
  })
  .add('agera / effectScope + mountable', () => {
    const $a = agera.mountable(agera.signal(0))
    const $b = agera.mountable(agera.signal(0))
    const destroy = agera.effectScope(() => {
      agera.effect(() => {
        $a()
      })
      agera.effect(() => {
        $a()
        $b()
      })
    })

    destroy()
  })

await bench.warmup()
await bench.run()

console.table(bench.table())

process.exit(0)
