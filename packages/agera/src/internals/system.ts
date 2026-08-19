import { isFunction } from '../utils.js'
import type {
  ReactiveNode,
  ReadableNode,
  SignalNode,
  ComputedNode,
  EffectNode,
  Link,
  Stack,
  AnySignal,
  WritableSignal,
  ReadableSignal,
  EffectCallback,
  Destroy,
  Compute,
  NewValue,
  DeferredScope
} from './types.js'
import {
  NoneFlag,
  MutableFlag,
  WatchingFlag,
  RecursedCheckFlag,
  RecursedFlag,
  DirtyFlag,
  PendingFlag,
  ScopeMode,
  WritableMode,
  MountableMode,
  LazyMode
} from './flags.js'

// #region Lifecycle sockets

// The sockets the optional lifecycle layer plugs into: they stay undefined
// until the "#region Lifecycle" at the end of the file wires them on first
// use, so the core paths carry no reference to it and bundles that never
// mount pay only the empty slot checks. Declared above the core because a
// slot must exist before the first core path that checks it
let lifecycleEdge: ((dep: ReactiveNode, sub?: ReactiveNode) => void) | undefined
let lifecycleSettle: (() => void) | undefined
// #endregion
// #region Core
let cycle = 0
let notifyIndex = 0
let queuedLength = 0
let batchDepth = 0
let flushDepth = 0
let activeSub: ReactiveNode | undefined
const queued: (EffectNode | undefined)[] = []

/**
 * Run a function without tracking dependencies.
 * @param fn
 * @returns The result of the function.
 */
export function untracked<T>(fn: () => T): T {
  const prevSub = pushActiveSub(undefined)

  try {
    return fn()
  } finally {
    popActiveSub(prevSub)
  }
}

function destroyEffect(dep: ReactiveNode) {
  const effect = dep as EffectNode
  const { destroy } = effect

  if (destroy !== undefined) {
    effect.destroy = undefined
    untracked(destroy)
  }
}

function update(node: ReactiveNode): boolean {
  if ('compute' in node) {
    return updateComputed(node as ComputedNode)
  }

  if ('pendingValue' in node) {
    return updateSignal(node as SignalNode)
  }

  // Effect scope node
  node.flags = MutableFlag

  return true
}

function notify(effect: EffectNode) {
  let insertIndex = queuedLength
  let firstInsertedIndex = insertIndex

  do {
    queued[insertIndex++] = effect
    effect.flags &= ~WatchingFlag
    effect = effect.subs?.sub as EffectNode

    if (effect === undefined || !(effect.flags & WatchingFlag)) {
      break
    }
  } while (true)

  queuedLength = insertIndex

  while (firstInsertedIndex < --insertIndex) {
    const left = queued[firstInsertedIndex]

    queued[firstInsertedIndex++] = queued[insertIndex]
    queued[insertIndex] = left
  }
}

function unwatched(node: ReactiveNode) {
  if (!(node.flags & MutableFlag)) {
    effectScopeOper.call(node)
  } else if (node.depsTail !== undefined) {
    node.depsTail = undefined
    node.flags = MutableFlag | DirtyFlag
    purgeDeps(node)
  }
}

function link(dep: ReactiveNode, sub: ReactiveNode, version: number): void {
  const prevDep = sub.depsTail

  if (prevDep !== undefined && prevDep.dep === dep) {
    return
  }

  const nextDep = prevDep !== undefined ? prevDep.nextDep : sub.deps

  if (nextDep !== undefined && nextDep.dep === dep) {
    nextDep.version = version
    sub.depsTail = nextDep
    return
  }

  const prevSub = dep.subsTail

  if (prevSub !== undefined && prevSub.version === version && prevSub.sub === sub) {
    return
  }

  const newLink =
    sub.depsTail =
      dep.subsTail =
        {
          version,
          dep,
          sub,
          prevDep,
          nextDep,
          prevSub,
          nextSub: undefined
        }

  if (nextDep !== undefined) {
    nextDep.prevDep = newLink
  }

  if (prevDep !== undefined) {
    prevDep.nextDep = newLink
  } else {
    sub.deps = newLink
  }

  if (prevSub !== undefined) {
    prevSub.nextSub = newLink
  } else {
    dep.subs = newLink
  }

  // The slot is tested first so a bundle without the lifecycle layer drops
  // the whole check, including the `modes` read
  if (lifecycleEdge !== undefined && dep.modes & MountableMode) {
    lifecycleEdge(dep, sub)
  }
}

function unlink(link: Link, sub = link.sub): Link | undefined {
  const {
    dep,
    prevDep,
    nextDep,
    nextSub,
    prevSub
  } = link

  if (nextDep !== undefined) {
    nextDep.prevDep = prevDep
  } else {
    sub.depsTail = prevDep
  }

  if (prevDep !== undefined) {
    prevDep.nextDep = nextDep
  } else {
    sub.deps = nextDep
  }

  if (nextSub !== undefined) {
    nextSub.prevSub = prevSub
  } else {
    dep.subsTail = prevSub
  }

  let unwatch = false

  if (prevSub !== undefined) {
    prevSub.nextSub = nextSub
  } else if ((dep.subs = nextSub) === undefined) {
    destroyEffect(dep)
    unwatch = true
  }

  if (lifecycleEdge !== undefined && dep.modes & MountableMode) {
    lifecycleEdge(dep)
  }

  if (unwatch) {
    unwatched(dep)
  }

  return nextDep
}

function propagate(link: Link): void {
  let next = link.nextSub
  let stack: Stack<Link | undefined> | undefined

  top: do {
    const sub = link.sub
    let flags = sub.flags

    if (!(flags & (RecursedCheckFlag | RecursedFlag | DirtyFlag | PendingFlag))) {
      sub.flags = flags | PendingFlag
    } else if (!(flags & (RecursedCheckFlag | RecursedFlag))) {
      // flags = NoneFlag
      flags &= MutableFlag
    } else if (!(flags & RecursedCheckFlag)) {
      sub.flags = (flags & ~RecursedFlag) | PendingFlag
    } else if (!(flags & (DirtyFlag | PendingFlag)) && isValidLink(link, sub)) {
      sub.flags = flags | (RecursedFlag | PendingFlag)
      flags &= MutableFlag
    } else {
      flags = NoneFlag
    }

    if (flags & WatchingFlag) {
      notify(sub as EffectNode)
    }

    if (flags & MutableFlag) {
      const subSubs = sub.subs

      if (subSubs !== undefined) {
        const nextSub = (link = subSubs).nextSub

        if (nextSub !== undefined) {
          stack = {
            value: next,
            prev: stack
          }
          next = nextSub
        }

        continue
      }
    }

    if ((link = next!) !== undefined) {
      next = link.nextSub
      continue
    }

    while (stack !== undefined) {
      link = stack.value!
      stack = stack.prev

      if (link !== undefined) {
        next = link.nextSub
        continue top
      }
    }

    break
  } while (true)
}

function checkDirty(link: Link, sub: ReactiveNode): boolean {
  let stack: Stack<Link> | undefined
  let checkDepth = 0
  let dirty = false

  top: do {
    const dep = link.dep
    const flags = dep.flags

    if (sub.flags & DirtyFlag) {
      dirty = true
    } else if ((flags & (MutableFlag | DirtyFlag)) === (MutableFlag | DirtyFlag)) {
      const subs = dep.subs!

      if (update(dep)) {
        if (subs.nextSub !== undefined) {
          shallowPropagate(subs)
        }

        dirty = true
      }
    } else if ((flags & (MutableFlag | PendingFlag)) === (MutableFlag | PendingFlag)) {
      stack = {
        value: link,
        prev: stack
      }

      link = dep.deps!
      sub = dep
      ++checkDepth
      continue
    }

    if (!dirty) {
      const nextDep = link.nextDep

      if (nextDep !== undefined) {
        link = nextDep
        continue
      }
    }

    while (checkDepth--) {
      link = stack!.value
      stack = stack!.prev

      if (dirty) {
        const subs = sub.subs!

        if (update(sub)) {
          if (subs.nextSub !== undefined) {
            shallowPropagate(subs)
          }

          sub = link.sub
          continue
        }

        dirty = false
      } else {
        sub.flags &= ~PendingFlag
      }

      sub = link.sub

      const nextDep = link.nextDep

      if (nextDep !== undefined) {
        link = nextDep
        continue top
      }
    }

    return dirty && sub.flags !== NoneFlag
  } while (true)
}

function shallowPropagate(link: Link): void {
  do {
    const sub = link.sub
    const flags = sub.flags

    if ((flags & (PendingFlag | DirtyFlag)) === PendingFlag) {
      sub.flags = flags | DirtyFlag

      if ((flags & (WatchingFlag | RecursedCheckFlag)) === WatchingFlag) {
        notify(sub as EffectNode)
      }
    }
  } while ((link = link.nextSub!) !== undefined)
}

function isValidLink(checkLink: Link, sub: ReactiveNode): boolean {
  let link = sub.depsTail

  while (link !== undefined) {
    if (link === checkLink) {
      return true
    }

    link = link.prevDep
  }

  return false
}

export function pushActiveSub(sub?: ReactiveNode) {
  const prevSub = activeSub

  activeSub = sub

  return prevSub
}

export function popActiveSub(prevSub?: ReactiveNode) {
  activeSub = prevSub
}

export function batch<T>(fn: () => T): T {
  ++batchDepth

  try {
    return fn()
  } finally {
    if (!--batchDepth) {
      flush()
    }
  }
}

let signalCallback: (($signal: AnySignal) => void) | undefined

export function onSignal(callback: ($signal: AnySignal) => void) {
  const prevCallback = signalCallback

  signalCallback = prevCallback
    ? $signal => (prevCallback($signal), callback($signal))
    : callback
}

/**
 * Create a signal function over a reactive node. The node is the operator's
 * `this`, so whatever a call site needs at read or write time lives on the
 * node and a signal costs one object and one bound function, nothing else.
 * @private
 * @param constructor - The operator: called with no arguments to read, with one to write.
 * @param node - The node the signal is a face of.
 * @returns A signal.
 */
export function createSignal<N extends ComputedNode | SignalNode>(
  constructor: (this: N, ...value: any[]) => unknown,
  node: N
) {
  const $signal = constructor.bind(node) as AnySignal

  $signal.node = node

  signalCallback?.($signal)

  return $signal
}

/**
 * Create a signal with atomic value.
 * @returns A signal.
 */
export function signal<T>(): WritableSignal<T | undefined>
/**
 * Create a signal with initial atomic value
 * @param value - Initial value of the signal.
 * @returns A signal.
 */
export function signal<T>(value: T): WritableSignal<T>

/* @__NO_SIDE_EFFECTS__ */
export function signal<T>(value?: T): WritableSignal<T | undefined> {
  return createSignal(signalOper, {
    value,
    pendingValue: value,
    subs: undefined,
    subsTail: undefined,
    flags: MutableFlag,
    modes: WritableMode
  }) as WritableSignal<T | undefined>
}

/**
 * Create a signal that reactivly computes its value from other signals.
 * @param compute - The function to compute the value.
 * @returns A signal.
 */
/* @__NO_SIDE_EFFECTS__ */
export function computed<T>(compute: Compute<T>): ReadableSignal<T> {
  return createSignal(computedOper, {
    value: undefined,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: NoneFlag,
    modes: NoneFlag,
    compute
  }) as ReadableSignal<T>
}

/**
 * Run effect function and re-run it on dependency change.
 * @param fn - The effect function to run.
 * @returns A function to stop the effect.
 */
export function effect(fn: EffectCallback): Destroy

/**
 * Run effect function and re-run it on dependency change.
 * The third argument is internal: it exists for `observe`, which must pair
 * the exemption with its node before the warmup boundary fires.
 * @internal
 * @param fn - The effect function to run.
 * @param noDefer - Ignore effect deferring.
 * @param lcx - The node this watcher must not keep mounted.
 * @returns A function to stop the effect.
 */
// oxlint-disable-next-line typescript/unified-signatures
export function effect(fn: EffectCallback, noDefer?: boolean, lcx?: ReactiveNode): Destroy

export function effect(fn: EffectCallback, noDefer?: boolean, lcx?: ReactiveNode): Destroy {
  const e: EffectNode = {
    fn,
    destroy: undefined,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: WatchingFlag | RecursedCheckFlag,
    modes: NoneFlag,
    lcx
  }

  lifecycleEdge?.(e, e)

  if (activeSub !== undefined) {
    link(e, activeSub, 0)

    if (!noDefer && activeSub.modes & LazyMode) {
      e.modes |= LazyMode
      return effectOper.bind(e)
    }
  }

  warmupEffect(e)

  return effectOper.bind(e)
}

/**
 * Run effect scope function to group effects.
 * @param fn - The effect scope function to run.
 * @returns A function to stop child effects.
 */
export function effectScope(fn: () => void): Destroy {
  const e: ReactiveNode = {
    deps: undefined,
    depsTail: undefined,
    subs: undefined,
    subsTail: undefined,
    flags: MutableFlag,
    modes: ScopeMode
  }
  const prevSub = pushActiveSub(e)

  if (prevSub !== undefined) {
    link(e, prevSub, 0)

    if (prevSub.modes & LazyMode) {
      e.modes |= LazyMode
    }
  }

  try {
    fn()
  } finally {
    popActiveSub(prevSub)
  }

  return effectScopeOper.bind(e)
}

/**
 * Manually trigger signals update propagation.
 * @param fn - Function with signal reads to trigger.
 */
export function trigger(fn: () => void) {
  const sub: ReactiveNode = {
    deps: undefined,
    depsTail: undefined,
    subs: undefined,
    subsTail: undefined,
    flags: WatchingFlag | RecursedCheckFlag,
    modes: NoneFlag
  }
  const prevSub = pushActiveSub(sub)

  ++batchDepth

  try {
    fn()
  } finally {
    popActiveSub(prevSub)
    sub.flags = NoneFlag

    let link = sub.deps

    while (link !== undefined) {
      const dep = link.dep

      link = unlink(link, sub)

      const subs = dep.subs

      if (subs !== undefined) {
        propagate(subs)
        shallowPropagate(subs)
      }
    }

    if (!--batchDepth) {
      flush()
    }
  }
}

function updateComputed(c: ComputedNode): boolean {
  ++cycle
  c.depsTail = undefined
  c.flags = MutableFlag | RecursedCheckFlag

  const prevSub = pushActiveSub(c)

  try {
    const oldValue = c.value

    return oldValue !== (c.value = c.compute(oldValue))
  } finally {
    popActiveSub(prevSub)
    c.flags &= ~RecursedCheckFlag
    purgeDeps(c)
    lifecycleSettle?.()
  }
}

function updateSignal(s: SignalNode): boolean {
  s.flags = MutableFlag
  return s.value !== (s.value = s.pendingValue)
}

function warmupEffect(e: EffectNode): void {
  const prevSub = pushActiveSub(e)

  try {
    e.destroy = e.fn(true) || undefined

    // Stopping is total: the effect reached STOPPED while this body was
    // still running, so finish the teardown the stop could not do - run the
    // destroy it just returned, and drop the links it made after it died,
    // because nothing will ever reach them again
    if (e.flags === NoneFlag) {
      destroyEffect(e)
      e.depsTail = undefined
      purgeDeps(e)
    }
  } finally {
    popActiveSub(prevSub)
    e.flags &= ~RecursedCheckFlag
    lifecycleSettle?.()
  }
}

function runEffect(e: EffectNode): void {
  const prevSub = pushActiveSub(e)

  try {
    e.destroy = e.fn() || undefined
  } finally {
    popActiveSub(prevSub)
    e.flags &= ~RecursedCheckFlag
    purgeDeps(e)
    lifecycleSettle?.()
  }
}

function run(e: EffectNode): void {
  const flags = e.flags

  if (
    flags & DirtyFlag
    || (
      flags & PendingFlag
      && checkDirty(e.deps!, e)
    )
  ) {
    if (e.destroy !== undefined) {
      destroyEffect(e)

      // Destroy function disposed the effect, do not re-run it
      if (e.flags === NoneFlag) {
        return
      }
    }

    ++cycle
    e.depsTail = undefined
    e.flags = WatchingFlag | RecursedCheckFlag

    runEffect(e)
  } else if (e.deps !== undefined) {
    e.flags = WatchingFlag
  }
}

function flush(): void {
  ++flushDepth

  try {
    while (notifyIndex < queuedLength) {
      const effect = queued[notifyIndex]!

      queued[notifyIndex++] = undefined
      run(effect)
    }
  } finally {
    while (notifyIndex < queuedLength) {
      const effect = queued[notifyIndex]!

      queued[notifyIndex++] = undefined
      effect.flags |= WatchingFlag | RecursedFlag
    }

    notifyIndex = 0
    queuedLength = 0
    --flushDepth

    lifecycleSettle?.()
  }
}

/**
 * The read operator of a computed node. Exported so that a call site can put
 * its own operator in front of one: a writable computed is this one with a
 * write branch before it.
 * @private
 * @returns The current value.
 */
export function computedOper<T>(this: ComputedNode<T>): T {
  const flags = this.flags

  if (
    flags & DirtyFlag
    || (
      flags & PendingFlag
      && (
        checkDirty(this.deps!, this)
        || (this.flags = flags & ~PendingFlag, false)
      )
    )
  ) {
    if (updateComputed(this)) {
      const subs = this.subs

      if (subs !== undefined) {
        shallowPropagate(subs)
      }
    }
  } else if (!flags) {
    this.flags = MutableFlag | RecursedCheckFlag

    const prevSub = pushActiveSub(this)

    try {
      this.value = this.compute()
    } finally {
      popActiveSub(prevSub)
      this.flags &= ~RecursedCheckFlag
      lifecycleSettle?.()
    }
  }

  if (activeSub !== undefined) {
    link(this, activeSub, cycle)
  }

  return this.value!
}

/**
 * Resolve the new value of a signal, calling the reducer form untracked.
 * A reducer is user code that runs while some effect may be running: its
 * reads must not become dependencies of that effect.
 * @param prevValue - The current value.
 * @param nextValue - The new value or a reducer of the current one.
 * @param arg - Extra argument passed to the reducer.
 * @returns The resolved value.
 */
export function nextValue<T, A>(prevValue: T, nextValue: NewValue<T, A>, arg?: A): T {
  if (isFunction(nextValue)) {
    const prevSub = pushActiveSub(undefined)

    try {
      return nextValue(prevValue, arg as A)
    } finally {
      popActiveSub(prevSub)
    }
  }

  return nextValue
}

export function signalNextValue<T>($signal: WritableSignal<T>, newValue: NewValue<T>): T {
  return nextValue($signal.node.pendingValue, newValue)
}

function signalOper<T>(this: SignalNode<T>, ...value: [NewValue<T>]): T | void {
  if (value.length) {
    const prevValue = this.pendingValue

    if (prevValue !== (this.pendingValue = nextValue(prevValue, value[0]))) {
      this.flags = MutableFlag | DirtyFlag

      const subs = this.subs

      if (subs !== undefined) {
        propagate(subs)

        if (!batchDepth && !flushDepth) {
          flush()
        }
      }
    }
  } else {
    if (this.flags & DirtyFlag) {
      if (updateSignal(this)) {
        const subs = this.subs

        if (subs !== undefined) {
          shallowPropagate(subs)
        }
      }
    }

    if (activeSub !== undefined) {
      link(this, activeSub, cycle)
    }

    return this.value
  }
}

function effectOper(this: EffectNode): void {
  destroyEffect(this)
  effectScopeOper.call(this)
}

// The STOPPED transition, shared by effect and scope disposal: make the node
// terminal, destroy what it owns, detach it from its position
function effectScopeOper(this: ReactiveNode): void {
  this.depsTail = undefined
  this.flags = NoneFlag
  // Spend the deferral token. This single line is what turns every stale
  // reference - a start walk cursor, a retained handle, a link made during
  // the teardown - into a no-op instead of a resurrection
  this.modes &= ~LazyMode
  purgeDeps(this)

  const sub = this.subs

  if (sub !== undefined) {
    const parent = sub.sub

    unlink(sub)

    // Stopping is total: a scope node holds no value, so one emptied by this
    // stop must not stay dirty or pending - `checkDirty` would descend into
    // deps that are gone
    if (parent.deps === undefined && parent.modes & ScopeMode) {
      parent.flags &= ~(DirtyFlag | PendingFlag)
    }
  }

  lifecycleSettle?.()
}

function purgeDeps(sub: ReactiveNode) {
  const depsTail = sub.depsTail
  let dep = depsTail !== undefined ? depsTail.nextDep : sub.deps

  while (dep !== undefined) {
    dep = unlink(dep, sub)
  }
}

// #endregion

// #region Defer scopes
//
// A deferred scope is an ordinary effect scope whose effects are captured
// but not warmed up: `deferScope` runs the body, `startScope` releases it,
// `stopScope` discards it. The layer introduces no node kind and no new
// field - the whole state machine is one mode bit on a scope node:
//
//   LazyMode set     LAZY      body ran, nothing was warmed up yet
//   LazyMode clear   STARTED   effects are live      (flags & MutableFlag)
//   LazyMode clear   STOPPED   effects are gone      (flags === NoneFlag)
//
// LAW 1 - LazyMode is a one-shot token.
// Minted in exactly one place, `deferScope`. Inherited everywhere else by a
// single rule shared with `effect` and `effectScope`: a node created at a
// lazy position is created lazy, so a subtree defers as one. Spent by
// exactly one of two claimants - `startScope`, which keeps the promise and
// warms the subtree up, or the STOPPED transition (`effectScopeOper`),
// which revokes it. Spending is always `modes &= ~LazyMode`.
// Every guard below is this one rule meeting an already spent token:
//   - `startScope` on a started or on a stopped scope - nothing to claim;
//   - a scope or an effect stopped by a sibling in the middle of the start
//     walk - the stop claimed it, the walk steps over it;
//   - a retained handle or a stale cursor into a stopped node - the same.
// A node may therefore be stopped at any moment, including from inside the
// walk that is starting it, and no participant has to know about it.
// Two edges sit outside the contract: stopping a node from inside its own
// still-running body leaves whatever the body creates after that point
// live (imperative self-teardown mid-body is not a supported move), and a
// lazy scope discarded by `unwatched` keeps an unspent token over already
// purged deps, so a later start finds nothing to do.
//
// LAW 2 - stopping is total.
// `stopScope` is defined on a scope in any state, at any moment, and has to
// leave a graph the core can still traverse. Its two obligations live with
// the STOPPED transition itself rather than here, because plain effect
// disposal owes exactly the same:
//   - `effectScopeOper`: a scope emptied by the stop drops DirtyFlag and
//     PendingFlag - a scope node holds no value, so `checkDirty` would
//     descend into deps that no longer exist;
//   - `warmupEffect`: an effect stopped while its own body is still running
//     finishes the teardown it missed - the destroy it returns is run, and
//     the links it made after it died are dropped.
//
// ORDER - both directions walk the same list, children first.
// A scope's `deps` is its capture list in creation order, holding nested
// scopes (`effectScope` and `deferScope` alike) and own effects; a scope
// created without a parent joins no capture list and is reached only
// through its handle. Start walks
// it twice - nested scopes, then own effects - so an effect body observes a
// subtree that is already live. Stop walks it once for nested scopes and
// leaves the own effects to `purgeDeps`, so a destroy observes a subtree
// that is already gone. Both walks may be edited under themselves: `unlink`
// leaves the removed link's `nextDep` intact, so a cursor survives the
// removal of the node it is standing on.
//
// POSITION - `boundDeferScope` captures a site, not a scope. Its anchor is
// an empty scope node that stays where it was created, so the scopes
// swapped through it keep their place among the siblings; it inherits the
// state of that site, so they follow the parent's start and stop.
//

function createScope(parent: ReactiveNode | undefined): ReactiveNode {
  const e: ReactiveNode = {
    deps: undefined,
    depsTail: undefined,
    subs: undefined,
    subsTail: undefined,
    flags: MutableFlag,
    modes: ScopeMode
  }

  if (parent !== undefined) {
    link(e, parent, 0)
    // Inherit the state of the position, exactly as `effect` and
    // `effectScope` do, so a subtree defers and starts as one
    e.modes |= parent.modes & LazyMode
  }

  return e
}

/**
 * Defer scope creation to delay its effects execution.
 * @internal
 * @param fn - The deferred scope function to run.
 * @param parent - Optional parent scope node to link the created scope to.
 * @returns Deferred scope handle.
 */
export function deferScope(fn: () => void, parent?: ReactiveNode): DeferredScope {
  const e = createScope(parent)
  const prevSub = pushActiveSub(e)

  // The single mint of the token: a deferred scope is lazy wherever it is
  // created, and everything the body creates below it inherits that
  e.modes |= LazyMode

  try {
    fn()
  } finally {
    popActiveSub(prevSub)
  }

  return e as unknown as DeferredScope
}

function startDeferred(e: ReactiveNode): void {
  const deps = e.deps

  if (deps !== undefined) {
    let nested: Link | undefined = deps
    let own: Link | undefined = deps

    // Nested scopes claim their token and release their own capture list
    // first, so an effect body below observes a subtree that is already live
    do {
      const dep = nested.dep

      nested = nested.nextDep

      if ((dep.modes & (LazyMode | ScopeMode)) === (LazyMode | ScopeMode)) {
        dep.modes &= ~LazyMode
        startDeferred(dep)
      }
    } while (nested !== undefined)

    // Then the effects captured directly here. Whatever still holds a token
    // is an effect: nested scopes were spent by the pass above, and anything
    // stopped meanwhile - by a sibling warmed up in this very walk - was
    // spent by the stop and is stepped over instead of being resurrected
    do {
      const dep = own.dep

      own = own.nextDep

      if (dep.modes & LazyMode) {
        dep.modes &= ~LazyMode
        warmupEffect(dep as EffectNode)
      }
    } while (own !== undefined)
  }
}

/**
 * Start deferred effects of the scope. Does nothing if the scope is already
 * started or stopped, or if it is linked to a parent that has not started
 * yet or is already stopped.
 * @internal
 * @param scope - Deferred scope handle.
 * @returns The same scope handle.
 */
export function startScope(scope: DeferredScope): DeferredScope {
  const e = scope as unknown as ReactiveNode
  const parent = e.subs?.sub

  if (
    e.modes & LazyMode
    && (
      // A linked scope starts with its position: never ahead of a parent
      // that is still LAZY, never under one that is already STOPPED
      parent === undefined
      || !(parent.modes & LazyMode) && parent.flags & MutableFlag
    )
  ) {
    e.modes &= ~LazyMode

    // What the lazy body left pending belongs to this moment - the scope
    // became live now, before any of its deferred effects add more
    lifecycleSettle?.()
    startDeferred(e)
  }

  return scope
}

/**
 * Stop the scope and destroy its effects.
 * @internal
 * @param scope - Deferred scope handle.
 */
export function stopScope(scope: DeferredScope): void {
  const e = scope as unknown as ReactiveNode
  // Nested scopes go first, so a destroy observes a subtree that is already
  // gone. Unlike the start walk this takes every scope child, LAZY or
  // STARTED: stopping is total, and a child left to `purgeDeps` below would
  // be torn down in list order and would keep an unspent token
  let nested = e.deps

  while (nested !== undefined) {
    const dep = nested.dep

    nested = nested.nextDep

    if (dep.modes & ScopeMode) {
      stopScope(dep as unknown as DeferredScope)
    }
  }

  // The other half - destroying the effects captured directly here - is the
  // `purgeDeps` of the shared STOPPED transition
  effectScopeOper.call(e)
}

/**
 * Capture the current scope as a position and create deferred scopes at it.
 * The anchor keeps that position among the siblings for the lifetime of the
 * capture site, and passes the parent's start and stop down to every scope
 * created through it.
 * Capture inside an effect: an anchor captured in an effect body is torn
 * down by the effect re-run in the deps order, not children-first.
 * The optional second argument of the factory is a sibling scope to replace:
 * it is stopped before the new scope body runs.
 * Created scopes are not started: use `startScope`.
 * @internal
 * @returns Function to create linked deferred scopes.
 */
export function boundDeferScope() {
  const anchor = createScope(activeSub)

  return (fn: () => void, replace?: DeferredScope): DeferredScope => {
    if (replace !== undefined) {
      stopScope(replace)
    }

    return deferScope(fn, anchor)
  }
}

// #endregion

// #region Lifecycle
//
// A mountable signal mounts when it gains its first live subscriber and
// unmounts when it loses the last one. The whole mechanism is a plugin
// behind the core's lifecycle slots, installed on first use - a bundle
// that never imports it pays only the empty slot checks.
//
// PRESENCE - mounted state is derived, never stored.
// Nothing counts subscribers. The authoritative answer is a question asked
// of the graph itself: does this node have a live path upward to an
// effect? `present` walks the node's subs, short-circuiting on the first
// live effect and relaying through mountable computeds (contagion marks
// every computed that ever linked a mountable dep). A state that is never
// stored cannot go stale, whenever the links were made; the walk itself is
// memoized (`lcs`/`lcv`), and the memo dies with any edge edit (`stamp`).
//
// LEVEL - mount and unmount are one event, a level change.
// Graph edits only enqueue the touched node as worth asking about. The
// drain compares the actual level against the last delivered one; equal
// means silence. Churn inside one turn is therefore invisible, and both
// directions travel the same road: sources mount before their dependents
// and unmount after them. A late listener joins with the settled level as
// its baseline - the `lcf` watermark tracks how much of the listener list
// the level was already delivered to.
//
// BOUNDARY - listeners run only on a consistent graph.
// The drain runs when the core is quiescent (no running subscriber, no
// open batch, no active flush). Listener code runs untracked and unowned,
// and whatever it creates is exempted from mounting the node that fired
// it, so a mount handler cannot keep its own node alive through a direct
// subscription (a path relayed through a computed is not exempted, as
// before this redesign; the exemption is captured at creation and does
// not travel to effects created by later re-runs). Delivery is best-effort under a throwing
// listener: the processed queue prefix is dropped, the tail survives.
// Registration from inside an `untracked` window of a running body counts
// as quiescent and delivers immediately.

const pending: ReadableNode[] = []
let pendingStart = 0
let stamp = 0
let draining = 0
let fireCtx: ReactiveNode | undefined

// A node handed to itself is a freshly created effect, not an edge: the
// two hooks share one slot
function onEdge(dep: ReactiveNode, sub?: ReactiveNode): void {
  if (dep !== sub) {
    // Contagion: a computed that links a mountable dep relays liveness
    if ((sub as ComputedNode | undefined)?.compute) {
      sub!.modes |= MountableMode
    }

    // The presence memo goes stale exactly when an edge changes
    ++stamp
    ;(dep as ReadableNode).lcq = pending.push(dep as ReadableNode)
  } else {
    // A queued effect re-run is not part of the listener's creation
    // frame: what it builds is a genuine subscriber. A node born with an
    // exemption (`observe`) keeps it
    dep.lcx ||= !flushDepth && fireCtx
  }
}

function present(node: ReadableNode): boolean {
  if (node.lcs !== stamp) {
    node.lcs = stamp
    node.lcv = false

    for (let link = node.subs; link; link = link.nextSub) {
      const sub = link.sub

      if (
        sub.lcx !== node
        && (
          // A live effect settles the question; anything else relays only
          // if it is a mountable computed
          sub.flags & WatchingFlag
          || sub.modes & MountableMode && present(sub as ReadableNode)
        )
      ) {
        node.lcv = true
        break
      }
    }
  }

  return node.lcv!
}

function walkDeps(node: ReadableNode): void {
  for (let link = (node as ComputedNode).deps; link; link = link.nextDep) {
    if (link.dep.modes & MountableMode) {
      evaluate(link.dep as ReadableNode)
    }
  }
}

function evaluate(node: ReadableNode): void {
  const mounted = present(node)
  const listeners = node.lcl
  const changed = !node.lcd === mounted
  // The delivered watermark doubles as the fire cursor. An unchanged level
  // is still delivered to listeners past it; a changed one rewinds to the
  // head. It stays undefined while nothing was ever delivered, which is
  // exactly the state in which no comparison against it may pass
  const from = node.lcf = changed ? 0 : node.lcf!
  // Undefined for a node that never had listeners: every comparison
  // against it is false, which is exactly the answer that state needs
  const to = listeners?.length as number

  node.lcd = mounted

  // Sources mount before their dependents and unmount after them
  if (changed && mounted) {
    walkDeps(node)
  }

  // Listeners run untracked and unowned, and whatever they create is
  // exempted from mounting the node that fired them. The cursor lives on
  // the node, so an unsubscribe from inside a firing listener keeps the
  // walk aligned with its splice through the same decrement it uses
  // outside a fire, and a listener registered during the fire is picked up
  // by the very next turn of the loop
  if ((mounted || changed) && from < to) {
    fireCtx = node

    // The live bound belongs to the mount fire only: a listener
    // registered during an unmount fire must stay silent until the next
    // mount, its first delivery is always `true`. The frozen bound lives
    // on the node, next to the cursor and spliced along with it, so a
    // listener unsubscribed from under the bound cannot pull a newcomer
    // below it - and both bounds stay inside the list, so the cursor never
    // reads a vacated slot
    node.lce = to

    while (node.lcf < (mounted ? listeners!.length : node.lce)) {
      listeners![node.lcf++](mounted)
    }
  }

  if (changed && !mounted) {
    walkDeps(node)
  }
}

function settle(): void {
  // Quiescent: no running subscriber except a started scope body, no open
  // batch and no active flush
  if (
    !draining
    && pending.length
    && (
      activeSub === undefined
      || (activeSub.modes & (ScopeMode | LazyMode)) === ScopeMode
    )
    && !batchDepth
    && !flushDepth
  ) {
    const prevSub = pushActiveSub(undefined)
    const prevCtx = fireCtx

    draining = 1

    try {
      // The queue is drained by a moving cursor: whatever a listener
      // enqueues is picked up by the same walk, in the order it arrived
      while (pendingStart < pending.length) {
        const node = pending[pendingStart++]

        // A node re-queued by the tear-down of its own dependent belongs
        // to that later position: firing at the first one would deliver a
        // source before the dependent that is going down with it
        if (node.lcq === pendingStart) {
          evaluate(node)
        }
      }
    } finally {
      // Nothing is dropped from under the queued positions: the array is
      // emptied only by a walk that reached its end, so after a listener
      // throw the tail survives for the next boundary exactly where its
      // positions say it is - and emptying it there is also what keeps
      // `pending.length` the whole quiescence test above
      if (pendingStart === pending.length) {
        pending.length = pendingStart = 0
      }

      fireCtx = prevCtx
      popActiveSub(prevSub)
      draining = 0
    }
  }
}

/**
 * Mark the node as lifecycle-relevant and re-derive its level at the next
 * boundary. Used when a node is marked mountable after it gained direct
 * subscribers; contagion through computeds linked before the marking is
 * not retroactive, and the marking itself does not invalidate the presence
 * memo - it stays valid until the next edge edit.
 * @internal
 * @param node - The node to touch.
 */
export function touchLifecycle(node: ReactiveNode): void {
  lifecycleEdge = onEdge
  lifecycleSettle = settle
  ;(node as ReadableNode).lcq = pending.push(node as ReadableNode)
  settle()
}

// #endregion
