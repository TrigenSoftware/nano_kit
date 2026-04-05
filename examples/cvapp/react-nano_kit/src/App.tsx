import { effect } from '@nano_kit/store'
import {
  page,
  layout,
  resetScroll,
  useNavigationListenLinks,
  router,
  usePageSignal
} from '@nano_kit/react-router'
import { useEffect } from 'react'
import {
  $location,
  navigation
} from './stores/router'
import { Layout } from './pages/Layout'
import { Home } from './pages/Home'
import { Application } from './pages/Application'

const $page = router($location, [
  layout(Layout, [
    page('home', Home),
    page('newApplication', Application),
    page('application', Application)
  ])
])

export function App() {
  const Page = usePageSignal($page)

  useNavigationListenLinks(navigation)

  useEffect(() => effect((initial) => {
    const shouldReset = $location.$action() !== 'replace' && !initial

    if (shouldReset) {
      resetScroll()
    }
  }), [])

  return Page && <Page/>
}
