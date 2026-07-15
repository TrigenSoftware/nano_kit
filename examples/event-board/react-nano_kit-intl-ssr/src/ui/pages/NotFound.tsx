import {
  useInject,
  useSignal
} from '@nano_kit/react'
import {
  Link,
  title
} from '@nano_kit/react-router'
import { inject } from '@nano_kit/store'
import { Intl$ } from '#src/stores/intl'

function Messages$() {
  const { messages } = inject(Intl$)

  return messages('notFound')
}

export function Stores$() {
  const [$t] = inject(Messages$)

  return [$t]
}

export function Head$() {
  const [$t] = inject(Messages$)

  return [
    title($t.$pageTitle)
  ]
}

export default function NotFoundPage() {
  const [$t] = useInject(Messages$)
  const t = useSignal($t)

  return (
    <section className='page'>
      <div className='page__header'>
        <p className='eyebrow'>{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>
          {t.description}
        </p>
      </div>

      <Link className='button button_secondary' to='home'>
        {t.backToEvents}
      </Link>
    </section>
  )
}
