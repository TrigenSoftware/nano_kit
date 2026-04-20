import { Outlet } from '@nano_kit/preact-router'

export default function Layout() {
  return (
    <>
      <main>
        <Outlet/>
      </main>
    </>
  )
}
