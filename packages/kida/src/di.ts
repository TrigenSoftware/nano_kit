/* oxlint-disable typescript/no-unsafe-return, eslint/no-param-reassign, trigen/naming-convention, eslint/new-cap */
import {
  type AnyFn,
  untracked
} from 'agera'

export type Injectable<T = unknown> = {
  injectable?: undefined
  /**
   * What the dependency has read while it was created, transitively,
   * united over all of its creations. Filled by the injection contexts.
   * A dependency that is in such reads has its own too, maybe empty.
   */
  _d?: Dependencies
  (): T
} | {
  injectable: true
  /**
   * What the dependency has read while it was created, transitively,
   * united over all of its creations. Filled by the injection contexts.
   * A dependency that is in such reads has its own too, maybe empty.
   */
  _d?: Dependencies
  new (): T
}

// A value, or with `provideAs` no value and the injectable to resolve instead
export type InjectionProvider = readonly [Injectable, unknown, Injectable?]

// What a dependency has read. Each member comes with the size the member's own reads had when they were last
// merged in: reads only grow, so a member whose reads still have that size has nothing new to give
interface Dependencies extends Map<Injectable, number | undefined> {
  // The read version when the reads were last closed transitively.
  _c?: number
  // A read is recorded without a size: nothing of the member has been merged in yet
  set(injectable: Injectable, size?: number): this
}

// Direct reads of the factory that is being created, restored when the creation ends
let reads: Dependencies | undefined
// Advanced when a read set gains a member: only that can extend transitive reachability.
let grown = 0
// Whether the context has the injectable: the requesting one, then the one the owner walk has ended in
let found: boolean | undefined

/**
 * InjectionContext holds dependencies for the current context in `deps`.
 * A lazily created dependency is kept in the deepest context of the chain that
 * provides something it has read, or in the top context.
 */
export class InjectionContext {
  /**
   * Values this context provides, owns or has already resolved.
   */
  declare readonly deps: Map<Injectable, unknown>
  // The provider tuples: what this context provides is decided here, never by `deps`
  declare readonly p: InjectionProvider[] | undefined
  // The parent context, public like `p` and `o`: a plain property is read without a brand check
  declare readonly u: InjectionContext | undefined

  constructor(
    providers?: InjectionProvider[],
    parent?: InjectionContext
  ) {
    this.deps = new Map(providers as InjectionProvider[] as (readonly [Injectable, unknown])[])
    this.u = parent
    this.p = providers
  }

  get<T>(injectable: Injectable<T>): T

  /**
   * With `lookup` nothing is created and nothing is cached here:
   * the result is `undefined` when the dependency is not provided or created yet.
   */
  get<T>(injectable: Injectable<T>, lookup?: boolean): T | undefined

  get<T>(injectable: Injectable<T>, lookup?: boolean): T | undefined {
    const value = this.deps.get(injectable)

    if (reads && !reads.has(injectable)) {
      reads.set(injectable)
      grown++
    }

    return value !== undefined
      ? value as T
      : this.r(injectable, lookup) as T
  }

  // Internal. For a context that does not have the injectable: the context to take it from or to create it in.
  // That is the nearest one above that has it, but past a context that provides something it has read only one that
  // provides it itself, otherwise the deepest context that provides something it has read, or the top one.
  // A top context answers itself. `found` tells which of the two it is
  o(
    injectable: Injectable,
    boundary?: InjectionContext | false
  ): InjectionContext {
    const deps = injectable._d
    const parent = this.u

    // Nothing above: no reads are needed to tell the owner
    if (!parent) {
      return boundary || this
    }

    // Refresh before ownership; a member may have learned more reads elsewhere.
    // Only the members whose own reads have grown since they were merged in are merged again, together with
    // the sizes they have recorded: what a closed member has brought in is not merged a second time.
    // Every member gets its own reads on the way: a token without them is in no reads
    if (deps && deps._c !== grown) {
      deps.forEach((size, dep) => {
        dep._d ??= new Map() as Dependencies

        if (dep._d.size !== size) {
          dep._d.forEach((depSize, depDep) => deps.set(depDep, depSize))
          deps.set(dep, dep._d.size)
        }
      })
      deps._c = grown
    }

    // A provided token without reads of its own is in no reads: the check is saved
    boundary ||= this.p?.find(provider => provider[0]._d && deps?.has(provider[0])) && this
    found = boundary
      ? Boolean(parent.p?.find(provider => provider[0] === injectable))
      : parent.deps.has(injectable)

    return found ? parent : parent.o(injectable, boundary)
  }

  // Internal: the cold path of `get`, taken whenever the value here is `undefined`
  r(injectable: Injectable, lookup?: boolean) {
    // The read version before the owner walk
    const version = grown
    // oxlint-disable-next-line typescript/no-this-alias
    let owner: InjectionContext = this
    let value: unknown

    // An undefined value here is provided so, is the marker of `provideAs`, or has been created or cached so
    found = this.deps.has(injectable)

    // The value is read only where it is found: a lookup that finds nothing returns `undefined`
    if (!found && (owner = this.o(injectable), found)) {
      value = owner.deps.get(injectable)
    }

    // Provided with `provideAs`: resolved as the alias from here, and the alias stays in its context.
    // `!value` stands for `undefined` here: no falsy value is ever put over the marker, so none finds an alias.
    // The last provider of the token wins, as it does in `deps`: unlike `findLast`, `reduce` is inlined by TurboFan
    const alias = found && !value && owner.p?.reduce(
      (last: unknown, provider) => (provider[0] === injectable ? provider[2] : last),
      value
    ) as Injectable | undefined

    // Created within this context, or resolved as the alias from here. A lookup creates nothing, but follows the alias
    if (alias || !found && !lookup) {
      const parentContext = currentContext
      const parentReads = reads

      try {
        // oxlint-disable-next-line typescript/no-this-alias
        currentContext = this
        // The token reads its alias as a factory reads what it injects: `get` records it, and only a new member
        // moves `grown`. So a context below that overrides what the alias reads is not taken for a copy.
        // A lookup records no such edge, its reads stay the caller's: the alias counts as read by the caller
        reads = lookup ? reads : injectable._d ??= new Map() as Dependencies
        value = alias
          ? this.get(alias, lookup)
          : untracked(injectable.injectable ? () => new injectable() : injectable)
      } finally {
        currentContext = parentContext
        reads = parentReads
      }

      // The created dependency is kept by its owner: nothing between them provides what the factory reads.
      // The owner is looked for again only when a read has been learned since the walk above:
      // nothing else can move the owner. The alias leaves the marker in its context as it is
      if (!alias) {
        if (version !== grown) {
          owner = this.o(injectable)
        }

        owner.deps.set(injectable, value)
      }
    }

    // The requesting context keeps a copy, never over the marker of `provideAs`.
    // A lookup keeps no copy: a cached `undefined` would hide an alias that is not created yet
    if (owner !== this && !lookup) {
      this.deps.set(injectable, value)
    }

    return value
  }
}

let currentContext: InjectionContext | undefined

/**
 * Get current injection context.
 * @returns The current injection context.
 */
/* @__NO_SIDE_EFFECTS__ */
export function getContext() {
  return currentContext
}

/**
 * Run a function within an injection context without untracking.
 * Reads inside will be tracked by the current tracking scope.
 * @param context - The injection context.
 * @param fn - The function to run.
 * @param args - The arguments to pass to the function.
 * @returns The return value of the function.
 */
export function unsafeRun<T extends AnyFn>(
  context: InjectionContext | undefined,
  fn: T,
  ...args: Parameters<T>
): ReturnType<T> {
  const parentContext = currentContext

  try {
    currentContext = context
    return fn(...args as unknown[])
  } finally {
    currentContext = parentContext
  }
}

/**
 * Run a function within an injection context.
 * @param context - The injection context.
 * @param fn - The function to run.
 * @param args - The arguments to pass to the function.
 * @returns The return value of the function.
 */
export function run<T extends AnyFn>(
  context: InjectionContext | undefined,
  fn: T,
  ...args: Parameters<T>
): ReturnType<T> {
  return untracked(() => unsafeRun(context, fn, ...args))
}

/**
 * Provide a dependency.
 * @param injectable - The injectable function or class to associate with the value.
 * @param value - The value of the dependency.
 * @returns The provider.
 */
/* @__NO_SIDE_EFFECTS__ */
export function provide<T>(injectable: Injectable<T>, value: T): InjectionProvider {
  return [injectable, value]
}

/**
 * Inject a dependency.
 * @param injectable - The injectable function or class to create or get the dependency.
 * @param context - Optional override for the injection context.
 * @returns The dependency.
 */
export function inject<T>(injectable: Injectable<T>, context = currentContext): T {
  if (import.meta.env.DEV && !context) {
    throw new Error('Cannot inject dependency outside of injection context')
  }

  return context!.get(injectable)
}

/**
 * Provide a dependency as another one: within the context it resolves exactly as the given one,
 * shares its instance and is created again where something the alias reads is overridden.
 * @param injectable - The injectable function or class to substitute.
 * @param alias - The injectable function or class to resolve instead.
 * @returns The provider.
 */
/* @__NO_SIDE_EFFECTS__ */
export function provideAs<T>(injectable: Injectable<T>, alias: Injectable<T>): InjectionProvider {
  return [injectable, undefined, alias]
}

export class DependencyNotFound extends Error {
  constructor(caller: string) {
    super(import.meta.env.DEV ? `${caller} dependency not found in context.` : caller)
  }
}

/**
 * Base class for class-based injectables.
 */
export class Injectable$ {
  static injectable = true as const
}
