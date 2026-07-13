import { renderer } from 'virtual:app-renderer'

if (!import.meta.env.VITEST) {
  console.log('Server:', renderer)
}

export { renderer }
