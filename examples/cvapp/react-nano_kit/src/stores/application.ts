import { computed } from '@nano_kit/store'
import {
  queryKey,
  abortable,
  abortSignal
} from '@nano_kit/query'
import type {
  ApplicationId,
  Application,
  ApplicationDraft
} from '~/services/application.types'
import * as ApplicationService from '~/services/application'
import {
  query,
  mutation,
  $data
} from './query'
import {
  navigation,
  paths,
  $applicationId
} from './router'

const ApplicationsKey = queryKey<[], Application[]>('applications')

export const [
  $applications,
  $applicationsError,
  $applicationsLoading
] = query<[], Application[]>(
  ApplicationsKey,
  [],
  () => ApplicationService.fetchApplications()
)

export const $applicationCount = computed(() => $applications()?.length ?? 0)

export const $currentApplication = computed(() => $applications()?.find(a => a.id === $applicationId()))

export const [
  upsertApplication,,
  $upsertApplicationError,
  $upsertApplicationLoading
] = mutation<[draft: ApplicationDraft], void>(async (draft, ctx) => {
  const letter = await ApplicationService.createLetter(draft, abortSignal(ctx))
  const application = await ApplicationService.createOrUpdateApplication({
    ...draft,
    letter
  })

  $data(ApplicationsKey(), (maybeApps) => {
    const apps = maybeApps ? [...maybeApps] : []
    const index = apps.findIndex(a => a.id === application.id)

    if (index === -1) {
      apps.unshift(application)
    } else {
      apps[index] = application
    }

    return apps
  })

  if (!draft.id) {
    navigation.replace(paths.application({
      id: application.id
    }))
  }
}, [
  abortable()
])

export const [
  deleteApplication,,
  $deleteApplicationError,
  $deleteApplicationLoading
] = mutation<[id: ApplicationId], void>(async (id) => {
  await ApplicationService.deleteApplication(id)

  $data(ApplicationsKey(), (maybeApps) => {
    const apps = maybeApps ? [...maybeApps] : []
    const index = apps.findIndex(a => a.id === id)

    if (index !== -1) {
      apps.splice(index, 1)
    }

    return apps
  })

  navigation.push(paths.home)
})
