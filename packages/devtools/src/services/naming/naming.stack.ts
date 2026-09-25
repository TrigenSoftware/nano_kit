import type {
  Adapter,
  LibraryDetector,
  StackFrame,
  StackOrigin
} from './naming.types.js'

// "    at Cart$ (http://localhost:5173/src/cart.ts:18:22)", "    at http://localhost:5173/src/main.ts:5:1"
const V8_FRAME = /^\s*at (?:(.*?) \()?(.+?):(\d+):(\d+)\)?$/
// "Cart$@http://localhost:5173/src/cart.ts:18:22", "@http://localhost:5173/src/main.ts:5:1"
const GECKO_FRAME = /^(.*?)@(.+?):(\d+):(\d+)$/
const FN_PREFIX = /^(?:async\*?\s*|new )*(?:(?:Object|Module|exports)\.)?/
// "Object.fn" and "Object.compute" of V8: a body with no name of its own, run by the core through its node
const CORE_CALL = /^Object\.(?:fn|compute)$/
// " [as get]" of V8 aliases, "/<" of Firefox for a function nested in a named one
const FN_SUFFIX = / \[as [^\]]+\]$|(?:\/<)+$/
const ANONYMOUS = /^(?:<anonymous>|anonymous|eval|global code|module code|eval code)?$/
const QUERY = /[?#].*$/
const LIBRARY = /\/node_modules\/|\/\.vite\/deps\/|^node:/
// "/@nano_kit/react/" of an installed package, "@nano_kit_react.js" of a dependency Vite pre-bundled
const ADAPTER = /@nano_kit[/_](react|preact|svelte)(?:[/_.-]|$)/

function cleanFn(raw = '') {
  const fn = raw.replace(FN_PREFIX, '').replace(FN_SUFFIX, '')

  return ANONYMOUS.test(fn) || CORE_CALL.test(raw) ? undefined : fn
}

/**
 * Parse the `stack` of an error: the V8 format of Chrome, Edge and Node, and the format Firefox and Safari share.
 * Lines that are not frames with a position, the message and native code among them, are left out.
 * @param stack
 * @returns The frames, innermost first.
 */
export function parseStack(stack: string) {
  const frames: StackFrame[] = []

  stack.split('\n').forEach((text) => {
    const match = V8_FRAME.exec(text) ?? GECKO_FRAME.exec(text)

    // A frame of evaluated code names the place of the `eval` instead of a file
    if (match && !match[2].startsWith('eval at ')) {
      frames.push({
        fn: cleanFn(match[1]),
        file: match[2].replace(QUERY, ''),
        line: Number(match[3]),
        column: Number(match[4])
      })
    }
  })

  return frames
}

/**
 * Whether a file belongs to a library: installed packages, the dependencies Vite pre-bundles and Node internals.
 * @param file
 * @returns Whether the frames of the file are skipped on the way to the application.
 */
export function isLibrary(file: string) {
  return LIBRARY.test(file)
}

/**
 * Find where in the application a stack comes from: the first frame outside libraries,
 * and the framework adapter of the kit among the library frames passed on the way.
 * @param frames - Frames, innermost first.
 * @param library - Which files are libraries.
 * @returns The origin.
 */
export function locate(frames: StackFrame[], library: LibraryDetector = isLibrary): StackOrigin {
  let adapter: Adapter | undefined

  for (const frame of frames) {
    if (!library(frame.file)) {
      return {
        frame,
        adapter
      }
    }

    adapter ??= ADAPTER.exec(frame.file)?.[1] as Adapter | undefined
  }

  return {
    frame: undefined,
    adapter
  }
}

/**
 * The last segment of a path or a URL.
 * @param file
 * @returns The file name.
 */
export function basename(file: string) {
  return file.slice(file.lastIndexOf('/') + 1)
}
