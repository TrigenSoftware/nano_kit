import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const [file] = process.argv.slice(2)

if (!file) {
  throw new Error('Expected a declaration file path.')
}

const path = resolve(process.cwd(), file)
const content = readFileSync(path, 'utf8')

if (
  !content.includes('LinkComponent<AppRoutes>')
  && !content.includes('LinkProps<AppRoutes')
) {
  throw new Error(`${file} does not preserve AppRoutes in public Link types.`)
}
