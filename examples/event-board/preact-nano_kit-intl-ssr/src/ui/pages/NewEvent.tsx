import { type TargetedEvent } from 'preact'
import { useEffect } from 'preact/hooks'
import {
  useInject,
  useSignal
} from '@nano_kit/preact'
import { title } from '@nano_kit/preact-router'
import { inject } from '@nano_kit/store'
import {
  raw,
  text
} from '@nano_kit/intl'
import { eventCategories } from '#src/services/events'
import { NewEventForm$ } from '#src/stores/events'
import { Intl$ } from '#src/stores/intl'

function Messages$() {
  const { messages } = inject(Intl$)

  return messages('newEvent', {
    pageTitle: text(),
    eyebrow: text(),
    title: text(),
    description: text(),
    shortcut: text(),
    titleLabel: text(),
    titlePlaceholder: text(),
    descriptionLabel: text(),
    descriptionPlaceholder: text(),
    startsAtLabel: text(),
    categoryLabel: text(),
    categories: raw<Record<string, string>>(),
    locationLabel: text(),
    locationPlaceholder: text(),
    errors: raw<Record<string, string>>(),
    creating: text(),
    create: text()
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

export default function NewEventPage() {
  const form = useInject(NewEventForm$)
  const [$t, $messagesPending] = useInject(Messages$)
  const titleValue = useSignal(form.$title)
  const description = useSignal(form.$description)
  const startsAt = useSignal(form.$startsAt)
  const location = useSignal(form.$location)
  const category = useSignal(form.$category)
  const errors = useSignal(form.$errors)
  const valid = useSignal(form.$valid)
  const createError = useSignal(form.$createError)
  const loading = useSignal(form.$createLoading)
  const messagesPending = useSignal($messagesPending)
  const t = useSignal($t)
  const onSubmit = (event: TargetedEvent<HTMLFormElement>) => {
    event.preventDefault()
    form.submit()
  }
  const setCategory = (event: TargetedEvent<HTMLSelectElement>) => {
    form.$category(event.currentTarget.value as typeof eventCategories[number])
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === 'm'
        && (event.ctrlKey || event.metaKey)
      ) {
        event.preventDefault()
        form.fillMock()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [form])

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
        <p className='shortcut-hint'>
          {t.shortcut}
        </p>
      </div>

      <form className='form' onSubmit={onSubmit}>
        <label className='field' htmlFor='event-title'>
          <span>{t.titleLabel}</span>
          <input
            id='event-title'
            name='title'
            value={titleValue}
            onChange={event => form.$title(event.currentTarget.value)}
            type='text'
            placeholder={t.titlePlaceholder}
            required
          />
          {errors.title && (
            <small>
              {t.errors?.title}
            </small>
          )}
        </label>

        <label className='field' htmlFor='event-description'>
          <span>{t.descriptionLabel}</span>
          <textarea
            id='event-description'
            name='description'
            value={description}
            onChange={event => form.$description(event.currentTarget.value)}
            placeholder={t.descriptionPlaceholder}
            required
          />
          {errors.description && (
            <small>
              {t.errors?.description}
            </small>
          )}
        </label>

        <div className='form__row'>
          <label className='field' htmlFor='event-starts-at'>
            <span>{t.startsAtLabel}</span>
            <input
              id='event-starts-at'
              name='startsAt'
              value={startsAt}
              onChange={event => form.$startsAt(event.currentTarget.value)}
              type='datetime-local'
              required
            />
            {errors.startsAt && (
              <small>
                {t.errors?.startsAt}
              </small>
            )}
          </label>

          <label className='field' htmlFor='event-category'>
            <span>{t.categoryLabel}</span>
            <select
              id='event-category'
              name='category'
              value={category}
              onChange={setCategory}
              required
            >
              {eventCategories.map(category => (
                <option key={category} value={category}>
                  {t.categories?.[category]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className='field' htmlFor='event-location'>
          <span>{t.locationLabel}</span>
          <input
            id='event-location'
            name='location'
            value={location}
            onChange={event => form.$location(event.currentTarget.value)}
            type='text'
            placeholder={t.locationPlaceholder}
            required
          />
          {errors.location && (
            <small>
              {t.errors?.location}
            </small>
          )}
        </label>

        {createError && (
          <div className='notice notice_error'>
            {createError}
          </div>
        )}

        <button className='button' type='submit' disabled={!valid || loading}>
          {loading ? t.creating : t.create}
        </button>
      </form>

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
