export interface StackFrame {
  /**
   * Function of the frame, without `async`, `new` and other prefixes; none for anonymous and top-level code.
   */
  fn: string | undefined
  /**
   * File or URL of the frame, without the query and the hash.
   */
  file: string
  line: number
  column: number
}

export type Adapter = 'react' | 'preact' | 'svelte'

/**
 * Where a node comes from, as far as its creation stack tells.
 */
export interface StackOrigin {
  /**
   * The first frame outside libraries: the creation site in the application.
   */
  frame: StackFrame | undefined
  /**
   * The framework adapter of the kit the stack went through on its way there.
   */
  adapter: Adapter | undefined
}

/**
 * A call stack nodes were created along, shared by all of them: the string and its parse.
 */
export interface StackTrace {
  stack: string
  /**
   * How many nodes were created along the stack so far.
   */
  count: number
  origin: StackOrigin | undefined
}

/**
 * What a node is named after: the call stack of the moment it appeared and its number among
 * the nodes of that stack.
 */
export type NodeOrigin = [trace: StackTrace, ordinal: number]

export interface NodeName {
  /**
   * The handle of the node: `quiet-otter`, or the name of the parent and the key for a child, `soft-badger.$name`.
   */
  name: string
  /**
   * The creation site, `cart.ts:18`. None for a node older than its record and for one created by libraries alone.
   */
  site: string | undefined
  /**
   * File or URL of the creation site.
   */
  file: string | undefined
  /**
   * The function the node was created in, `Cart$`, otherwise the name of the file.
   */
  owner: string | undefined
  adapter: Adapter | undefined
}

/**
 * Tells the frames of libraries from the frames of the application by their file.
 */
export type LibraryDetector = (file: string) => boolean
