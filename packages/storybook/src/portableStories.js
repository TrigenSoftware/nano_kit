import {
  composeStory as originalComposeStory,
  composeStories as originalComposeStories,
  setProjectAnnotations as originalSetProjectAnnotations,
  setDefaultProjectAnnotations
} from 'storybook/preview-api'
import * as defaultProjectAnnotations from './entryPreview.js'

export function setProjectAnnotations(projectAnnotations) {
  setDefaultProjectAnnotations(defaultProjectAnnotations)
  originalSetProjectAnnotations(projectAnnotations)
}

export function composeStory(story, componentAnnotations, projectAnnotations, exportsName) {
  return originalComposeStory(story, componentAnnotations, projectAnnotations, defaultProjectAnnotations, exportsName)
}

export function composeStories(csfExports, projectAnnotations) {
  return originalComposeStories(csfExports, projectAnnotations, composeStory)
}
