import {
  router,
  usePageSignal
} from '@nano_kit/react-router'
import { $location } from './stores/router'
import { pages } from './pages'

const $page = router($location, pages)

export function App() {
  const Page = usePageSignal($page)

  return Page && <Page />
}
