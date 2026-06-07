import type {
  Application,
  ApplicationDraft
} from '~/services/application.types'

const fields = ['title', 'company', 'skills', 'details'] as const

/**
 * Determines whether to prevent navigation away from the form
 * @param currentApplication - The existing application data, if any.
 * @param formData - The current form data.
 * @returns Whether to prevent the transition.
 */
export function shouldPreventTransition(
  currentApplication: Application | undefined,
  formData: ApplicationDraft
): boolean {
  if (!currentApplication) {
    return fields.some((key) => {
      const value = formData[key]

      return typeof value === 'string' && value.trim() !== ''
    })
  }

  return fields.some(key => formData[key] !== currentApplication[key])
}
