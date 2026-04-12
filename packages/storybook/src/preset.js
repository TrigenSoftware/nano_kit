import { fileURLToPath } from 'node:url'

export function previewAnnotations(
  input = []
) {
  return [
    ...input,
    fileURLToPath(import.meta.resolve('@nanoviews/storybook/entry-preview'))
  ]
}
