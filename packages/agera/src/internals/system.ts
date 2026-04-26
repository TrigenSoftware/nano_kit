import { isFunction } from '../utils.js'
import type {
  ReactiveNode,
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
  Morph
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
import {
  incrementEffectCount,
  isActiveSubscriber,
  decrementEffectCount,
  notifyMounted,
  isMountableUsed,
  pushNoMount,
  popNoMount,
  activeNoMount
} from './lifecycle.js'

let cycle = 0
let batchDepth = 0
let notifyIndex = 0
let queuedLength = 0
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

  if (effect.destroy !== undefined) {
    untracked(effect.destroy)
    effect.destroy = undefined
  }
}

function update(node: SignalNode | ComputedNode): boolean {
  if (node.depsTail !== undefined) {
    return updateComputed(node as ComputedNode)
  }

  return updateSignal(node as SignalNode)
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

  const isDepMountable = isMountableUsed && dep.modes & MountableMode

  // Mark computed signals as mountable if any of their dependencies are mountable
  if (isDepMountable && 'compute' in sub) {
    sub.modes |= MountableMode
  }

  if (isDepMountable && isActiveSubscriber(sub) && sub.noMount !== dep) {
    incrementEffectCount(dep)
  }
}

function unlink(link: Link, sub = link.sub): Link | undefined {
  const dep = link.dep
  const prevDep = link.prevDep
  const nextDep = link.nextDep
  const nextSub = link.nextSub
  const prevSub = link.prevSub

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

  if (isMountableUsed && dep.modes & MountableMode && sub.noMount !== dep) {
    decrementEffectCount(dep, unwatch)
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
      if (update(dep as SignalNode | ComputedNode)) {
        const subs = dep.subs!

        if (subs.nextSub !== undefined) {
          shallowPropagate(subs)
        }

        dirty = true
      }
    } else if ((flags & (MutableFlag | PendingFlag)) === (MutableFlag | PendingFlag)) {
      if (link.nextSub !== undefined || link.prevSub !== undefined) {
        stack = {
          value: link,
          prev: stack
        }
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
      const firstSub = sub.subs!
      const hasMultipleSubs = firstSub.nextSub !== undefined

      if (hasMultipleSubs) {
        link = stack!.value
        stack = stack!.prev
      } else {
        link = firstSub
      }

      if (dirty) {
        if (update(sub as SignalNode | ComputedNode)) {
          if (hasMultipleSubs) {
            shallowPropagate(firstSub)
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

    return dirty
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

export function createSignal(
  constructor: (value?: unknown) => unknown,
  node: ComputedNode | SignalNode,
  ctx: ComputedNode | SignalNode | Morph = node
) {
  const $signal = constructor.bind(ctx) as AnySignal

  $signal.node = node

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
    modes: WritableMode,
    subsCount: 0
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
    compute,
    subsCount: 0
  }) as ReadableSignal<T>
}

/**
 * Run effect function and re-run it on dependency change.
 * @param fn - The effect function to run.
 * @param noDefer - Ignore effect deferring.
 * @returns A function to stop the effect.
 */
export function effect(fn: EffectCallback, noDefer = false): Destroy {
  const e: EffectNode = {
    fn,
    destroy: undefined,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: WatchingFlag | RecursedCheckFlag,
    modes: NoneFlag
  }

  if (isMountableUsed && activeNoMount !== undefined) {
    e.noMount = activeNoMount
  }

  if (activeSub !== undefined) {
    link(e, activeSub, 0)

    if (!noDefer && activeSub.modes & LazyMode) {
      e.modes |= LazyMode
      return effectOper.bind(e)
    }
  }

  runEffect(e, true)

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
    flags: NoneFlag,
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
 * Defer scope creation to delay its effects execution.
 * @param fn - The deferred scope function to run.
 * @returns A function to start effects.
 */
export function deferScope(fn: () => void): () => Destroy {
  const e: ReactiveNode = {
    deps: undefined,
    depsTail: undefined,
    subs: undefined,
    subsTail: undefined,
    flags: NoneFlag,
    modes: ScopeMode | LazyMode
  }
  const prevSub = pushActiveSub(e)

  try {
    fn()
  } finally {
    popActiveSub(prevSub)
  }

  return deferScopeOper.bind(e)
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
    flags: WatchingFlag,
    modes: NoneFlag
  }
  const prevSub = pushActiveSub(sub)

  try {
    fn()
  } finally {
    popActiveSub(prevSub)

    let link = sub.deps

    while (link !== undefined) {
      const dep = link.dep

      link = unlink(link, sub)

      const subs = dep.subs

      if (subs !== undefined) {
        sub.flags = NoneFlag
        propagate(subs)
        shallowPropagate(subs)
      }
    }

    if (!batchDepth) {
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
    notifyMounted(activeSub)
  }
}

function updateSignal(s: SignalNode): boolean {
  s.flags = MutableFlag
  return s.value !== (s.value = s.pendingValue)
}

function runEffect(e: EffectNode, warmup?: true): void {
  const prevSub = pushActiveSub(e)
  const prevNoMount = pushNoMount(e.noMount)

  try {
    destroyEffect(e)
    e.destroy = e.fn(warmup) || undefined
  } finally {
    popNoMount(prevNoMount)
    popActiveSub(prevSub)
    e.flags &= ~RecursedCheckFlag

    if (warmup === undefined) {
      purgeDeps(e)
    }

    notifyMounted(activeSub)
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
    ++cycle
    e.depsTail = undefined
    e.flags = WatchingFlag | RecursedCheckFlag

    runEffect(e)
  } else {
    e.flags = WatchingFlag
  }
}

function flush(): void {
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
  }
}

function computedOper<T>(this: ComputedNode<T>): T {
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
    }
  }

  const sub = activeSub

  if (sub !== undefined) {
    link(this, sub, cycle)
  }

  return this.value!
}

export function nextValue<T>(prevValue: T, nextValue: NewValue<T>): T {
  return isFunction(nextValue) ? nextValue(prevValue) : nextValue
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

        if (!batchDepth) {
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

    let sub = activeSub

    while (sub !== undefined) {
      if (sub.flags & (MutableFlag | WatchingFlag)) {
        link(this, sub, cycle)
        break
      }

      sub = sub.subs?.sub
    }

    return this.value
  }
}

function effectOper(this: EffectNode): void {
  destroyEffect(this)
  effectScopeOper.call(this)
}

function effectScopeOper(this: ReactiveNode): void {
  this.depsTail = undefined
  this.flags = NoneFlag
  purgeDeps(this)

  const sub = this.subs

  if (sub !== undefined) {
    unlink(sub)
  }
}

function runDeferredEffects(link: Link): void {
  do {
    const dep = link.dep
    const nextDep = link.nextDep

    if (dep.modes & LazyMode) {
      dep.modes &= ~LazyMode

      if (dep.modes & ScopeMode) {
        if (dep.deps !== undefined) {
          runDeferredEffects(dep.deps)
        }
      } else {
        runEffect(dep as EffectNode, true)
      }
    }

    link = nextDep!
  } while (link !== undefined)
}

function deferScopeOper(this: ReactiveNode): Destroy {
  this.modes &= ~LazyMode

  notifyMounted(activeSub)

  if (this.deps !== undefined) {
    runDeferredEffects(this.deps)
  }

  return effectScopeOper.bind(this)
}

function purgeDeps(sub: ReactiveNode) {
  const depsTail = sub.depsTail
  let dep = depsTail !== undefined ? depsTail.nextDep : sub.deps

  while (dep !== undefined) {
    dep = unlink(dep, sub)
  }
}
