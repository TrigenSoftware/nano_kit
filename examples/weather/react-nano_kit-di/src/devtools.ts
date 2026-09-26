import { devtools } from '@nano_kit/devtools'

if (import.meta.env.DEV) {
  // The kit is linked from the workspace as sources: its files are libraries all the same
  devtools({
    library: file => file.includes('/packages/')
  })
}
