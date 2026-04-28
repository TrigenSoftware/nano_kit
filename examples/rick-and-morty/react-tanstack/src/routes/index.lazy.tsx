import { createLazyRoute } from '@tanstack/react-router'

export const Route = createLazyRoute('/')({
  component: () => <div>Home</div>
})
