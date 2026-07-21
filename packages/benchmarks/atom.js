import { Bench } from 'tinybench'
import * as nanostores from 'nanostores'
import * as signals from 'alien-signals-1'
import * as signals3 from 'alien-signals-3'
import * as rxjs from 'rxjs'
import * as effector from 'effector'
import * as mobx from 'mobx'
import * as valtio from 'valtio'
import * as svelteStore from 'svelte/store'
import * as jotai from 'jotai'
import * as agera from '../agera/dist/index.js' // 'agera'

const bench = new Bench({
  warmup: true,
  time: 1000
})

bench
  .add('nanostores / atom', () => {
    const $store = nanostores.atom(0)

    $store.set($store.get() + 1)
  })
  .add('alien-signals-1 / signal', () => {
    const $store = signals.signal(0)

    $store($store() + 1)
  })
  .add('alien-signals-3 / signal', () => {
    const $store = signals3.signal(0)

    $store($store() + 1)
  })
  .add('agera / signal', () => {
    const $store = agera.signal(0)

    $store($store() + 1)
  })
  .add('agera / signal + mountable', () => {
    const $store = agera.mountable(agera.signal(0))

    $store($store() + 1)
  })
  .add('rxjs / BehaviorSubject', () => {
    const $store = new rxjs.BehaviorSubject(0)

    $store.next($store.getValue() + 1)
  })
  .add('effector / store', () => {
    const inc = effector.createEvent()
    const $store = effector.createStore(0).on(inc, s => s + 1)

    inc()
  })
  .add('mobx / observable.box', () => {
    const $store = mobx.observable.box(0)

    $store.set($store.get() + 1)
  })
  .add('valtio / proxy', () => {
    const $store = valtio.proxy({
      v: 0
    })

    $store.v += 1
  })
  .add('svelte/store / writable', () => {
    const $store = svelteStore.writable(0)

    $store.update(n => n + 1)
  })
  .add('jotai / atom (createStore)', () => {
    const store = jotai.createStore()
    const count = jotai.atom(0)

    store.set(count, c => c + 1)
  })

await bench.run()

console.table(bench.table())

process.exit(0)
