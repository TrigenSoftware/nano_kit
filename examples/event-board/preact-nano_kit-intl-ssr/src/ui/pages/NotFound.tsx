import {
  useInject,
  useSignal
} from '@nano_kit/preact'
import {
  Link,
  title
} from '@nano_kit/preact-router'
import { inject } from '@nano_kit/store'
import { text } from '@nano_kit/intl'
import { Intl$ } from '#src/stores/intl'

function Messages$() {
  const { messages } = inject(Intl$)

  return messages('notFound', {
    pageTitle: text(),
    eyebrow: text(),
    title: text(),
    description: text(),
    backToEvents: text()
  })
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
  const [$t, $messagesPending] = useInject(Messages$)
  const t = useSignal($t)
  const messagesPending = useSignal($messagesPending)

  return (
    <section
      className='page message-block'
      aria-busy={messagesPending}
    >
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

      {messagesPending && (
        <div className='message-block__overlay' role='status' aria-live='polite'>
          <div className='loading-overlay__content'>
            <span className='loading-overlay__spinner' aria-hidden='true' />
          </div>
        </div>
      )}
    </section>
  )
}
