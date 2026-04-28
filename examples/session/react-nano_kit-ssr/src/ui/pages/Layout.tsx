import {
  Outlet,
  meta,
  title,
  useSyncHead
} from '@nano_kit/react-router'

export function Head$() {
  return [
    title('Session Cookies'),
    meta({
      charSet: 'utf-8'
    }),
    meta({
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    })
  ]
}

export default function Layout() {
  useSyncHead()

  return (
    <main className='shell'>
      <Outlet />
    </main>
  )
}
