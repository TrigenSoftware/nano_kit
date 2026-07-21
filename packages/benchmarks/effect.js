import assert from 'node:assert/strict'
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
import * as reatom from '@reatom/core'
import * as agera from '../agera/dist/index.js' // 'agera'

const bench = new Bench({
  warmup: true,
  time: 1000,
  throws: true
})

bench
  .add('nanostores / effect', () => {
    const $store = nanostores.atom(0)
    const logs = []
    const unsub = nanostores.effect([$store], (store) => {
      logs.push(store)
    })

    $store.set($store.get() + 1)
    $store.set($store.get() + 1)

    unsub()
    assert.equal(logs.length, 3)
  })
  .add('alien-signals-1 / effect', () => {
    const $store = signals.signal(0)
    const logs = []
    const unsub = signals.effect(() => {
      logs.push($store())
    })

    $store($store() + 1)
    $store($store() + 1)

    unsub()
    assert.equal(logs.length, 3)
  })
  .add('alien-signals-3 / effect', () => {
    const $store = signals3.signal(0)
    const logs = []
    const unsub = signals3.effect(() => {
      logs.push($store())
    })

    $store($store() + 1)
    $store($store() + 1)

    unsub()
    assert.equal(logs.length, 3)
  })
  .add('agera / effect', () => {
    const $store = agera.signal(0)
    const logs = []
    const unsub = agera.effect(() => {
      logs.push($store())
    })

    $store($store() + 1)
    $store($store() + 1)

    unsub()
    assert.equal(logs.length, 3)
  })
  .add('agera / effect (update fn)', () => {
    const $store = agera.signal(0)
    const logs = []
    const unsub = agera.effect(() => {
      logs.push($store())
    })

    $store(value => value + 1)
    $store(value => value + 1)

    unsub()
    assert.equal(logs.length, 3)
  })
  .add('agera / effect + mountable', () => {
    const $store = agera.mountable(agera.signal(0))
    const logs = []
    const unsub = agera.effect(() => {
      logs.push($store())
    })

    $store($store() + 1)
    $store($store() + 1)

    unsub()
    assert.equal(logs.length, 3)
  })
  .add('rxjs / BehaviorSubject (effect)', () => {
    const $store = new rxjs.BehaviorSubject(0)
    const logs = []
    const sub = $store.subscribe(v => logs.push(v))

    $store.next($store.getValue() + 1)
    $store.next($store.getValue() + 1)

    sub.unsubscribe()
    assert.equal(logs.length, 3)
  })
  .add('effector / watch (effect)', () => {
    const inc = effector.createEvent()
    const $store = effector.createStore(0).on(inc, s => s + 1)
    const logs = []
    const unsub = $store.watch(v => logs.push(v))

    inc()
    inc()

    unsub()
    assert.equal(logs.length, 3)
  })
  .add('mobx / autorun (effect)', () => {
    const $store = mobx.observable.box(0)
    const logs = []
    const disposer = mobx.autorun(() => {
      logs.push($store.get())
    })
    const inc = mobx.action(() => {
      $store.set($store.get() + 1)
    })

    inc()
    inc()

    disposer()
    assert.equal(logs.length, 3)
  })
  .add('valtio / subscribe (effect)', async () => {
    const $store = valtio.proxy({
      v: 0
    })
    const logs = [$store.v]
    const unsub = valtio.subscribe($store, () => logs.push($store.v))

    $store.v += 1
    await Promise.resolve()
    $store.v += 1
    await Promise.resolve()

    unsub()
    assert.equal(logs.length, 3)
  })
  .add('svelte/store / subscribe (effect)', () => {
    const $store = svelteStore.writable(0)
    const logs = []
    const unsub = $store.subscribe(v => logs.push(v))

    $store.update(n => n + 1)
    $store.update(n => n + 1)

    unsub()
    assert.equal(logs.length, 3)
  })
  .add('jotai / createStore (sub)', () => {
    const store = jotai.createStore()
    const a = jotai.atom(0)
    const logs = [store.get(a)]
    const unsub = store.sub(a, value => logs.push(value))

    store.set(a, c => c + 1)
    store.set(a, c => c + 1)

    unsub()
    assert.equal(logs.length, 3)
  })
  .add('@reatom/core / effect', () => {
    const a = reatom.atom(0)
    const logs = []
    const unsub = reatom.effect(() => {
      logs.push(a())
    })

    a.set(a() + 1)
    a.set(a() + 1)

    unsub()
    assert.equal(logs.length, 2)
  })
  .add('@reatom/core / effect (update fn)', () => {
    const a = reatom.atom(0)
    const logs = []
    const unsub = reatom.effect(() => {
      logs.push(a())
    })

    a.set(v => v + 1)
    a.set(v => v + 1)

    unsub()
    assert.equal(logs.length, 2)
  })

await bench.run()

console.table(bench.table())

process.exit(0)
