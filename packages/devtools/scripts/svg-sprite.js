import {
  resolve,
  join,
  basename
} from 'node:path'
import {
  readFile,
  writeFile,
  glob
} from 'node:fs/promises'
import SVGSpriter from 'svg-sprite'

const rootDir = resolve(import.meta.dirname, '..')
const spriter = new SVGSpriter({
  mode: {
    symbol: true
  }
})
const iconFiles = glob(join(rootDir, 'src', 'assets', 'icons', '*.svg'))
const tasks = []

for await (const filePath of iconFiles) {
  const fileName = basename(filePath)

  tasks.push(readFile(filePath, 'utf-8').then((content) => {
    spriter.add(fileName, fileName, content)
  }))
}

await Promise.all(tasks)

const { result } = await spriter.compileAsync()

await writeFile(join(rootDir, 'src', 'assets', 'sprite.svg'), result.symbol.sprite.contents)
