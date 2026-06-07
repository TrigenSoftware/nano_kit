import fs from 'fs'
import {
  type HeadDescriptor,
  link,
  script
} from '@nano_kit/router'
import type {
  ManifestOptions,
  ManifestChunk,
  ManifestRecord
} from './manifest.types.js'

export type * from './manifest.types.js'

/**
 * A helper class representing the Vite manifest and providing methods to get the asset tags for a given set of entry points.
 */
export class Manifest {
  public manifest: ManifestRecord = {}
  public base = '/'
  readonly #assetsTagsCache = new Map<string, HeadDescriptor[]>()

  constructor(options: ManifestOptions = {}) {
    if (options.base) {
      this.base = options.base
    }

    if (options.manifestPath) {
      this.loadManifest(options.manifestPath)
    }
  }

  #getEntryKey() {
    return Object.values(this.manifest).find(chunk => chunk.isEntry)!.src!
  }

  #resolveKeys(
    keys: string[],
    visited = new Set<string>(),
    out: ManifestChunk[] = []
  ) {
    const { manifest } = this

    for (let i = 0, len = keys.length, key; i < len; i++) {
      key = keys[i]

      if (visited.has(key)) {
        continue
      }

      visited.add(key)

      const chunk = manifest[key]

      if (!chunk) {
        continue
      }

      out.push(chunk)

      if (chunk.imports) {
        this.#resolveKeys(chunk.imports, visited, out)
      }
    }

    return out
  }

  /**
   * Loads the manifest from the given path.
   * @param path
   */
  loadManifest(path: string) {
    this.manifest = JSON.parse(fs.readFileSync(path, 'utf-8')) as ManifestRecord
  }

  /**
   * Gets the asset tags for the given entries.
   * The main entry is automatically included, so it should not be included in the `entries` argument.
   * @param entries - The list of entry points to get the asset tags for.
   * @returns The list of asset tags for the given entries.
   */
  getAssetsTags(entries: string[] = []) {
    const cacheKey = entries.join('\0')
    const cache = this.#assetsTagsCache
    const cached = cache.get(cacheKey)

    if (cached) {
      return cached
    }

    const { manifest, base } = this
    const allEntries = [this.#getEntryKey(), ...entries]
    const allChunks = this.#resolveKeys(allEntries)
    const mainChunk = manifest[allEntries[0]]
    const seen = new Set<string>([mainChunk.file])
    const tags: HeadDescriptor[] = []

    for (let i = 0, len = allChunks.length, css; i < len; i++) {
      css = allChunks[i].css

      if (css) {
        for (let j = 0, clen = css.length; j < clen; j++) {
          if (!seen.has(css[j])) {
            tags.push(link({
              rel: 'stylesheet',
              href: `${base}${css[j]}`
            }))
            seen.add(css[j])
          }
        }
      }
    }

    tags.push(script({
      type: 'module',
      src: `${base}${mainChunk.file}`
    }))

    for (let i = 0, len = allChunks.length, chunk; i < len; i++) {
      chunk = allChunks[i]

      if (chunk === mainChunk) {
        continue
      }

      if (!seen.has(chunk.file)) {
        tags.push(link({
          rel: 'modulepreload',
          href: `${base}${chunk.file}`
        }))
        seen.add(chunk.file)
      }
    }

    cache.set(cacheKey, tags)

    return tags
  }
}
