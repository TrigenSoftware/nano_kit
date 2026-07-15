<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import { title } from '@nano_kit/svelte-router'
  import { NewEventForm$ } from '#src/stores/events'
  import { Intl$ } from '#src/stores/intl'

  function Messages$() {
    const { messages } = inject(Intl$)

    return messages('newEvent')
  }

  export function Stores$() {
    const [t] = inject(Messages$)

    return [t]
  }

  export function Head$() {
    const [t] = inject(Messages$)

    return [
      title(t.$pageTitle)
    ]
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import { getInject } from '@nano_kit/svelte'
  import {
    type EventCategory,
    eventCategories
  } from '#src/services/events'

  const form = getInject(NewEventForm$)
  const {
    $title: titleValue,
    $description: description,
    $startsAt: startsAt,
    $location: location,
    $category: category,
    $errors: errors,
    $valid: valid,
    $createError: createError,
    $createLoading: loading
  } = form
  const [t] = getInject(Messages$)

  function onSubmit(event: SubmitEvent) {
    event.preventDefault()
    form.submit()
  }

  function onCategory(event: Event) {
    form.$category((event.currentTarget as HTMLSelectElement).value as EventCategory)
  }

  onMount(() => {
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
  })
</script>

<section class="page">
  <div class="page__header">
    <p class="eyebrow">{$t.eyebrow}</p>
    <h1>{$t.title}</h1>
    <p>
      {$t.description}
    </p>
    <p class="shortcut-hint">
      {$t.shortcut}
    </p>
  </div>

  <form class="form" onsubmit={onSubmit}>
    <label class="field" for="event-title">
      <span>{$t.titleLabel}</span>
      <input
        id="event-title"
        name="title"
        value={$titleValue}
        oninput={(event) => form.$title((event.currentTarget as HTMLInputElement).value)}
        type="text"
        placeholder={$t.titlePlaceholder}
        required
      />
      {#if $errors.title}<small>{$t.errors?.title}</small>{/if}
    </label>

    <label class="field" for="event-description">
      <span>{$t.descriptionLabel}</span>
      <textarea
        id="event-description"
        name="description"
        value={$description}
        oninput={(event) => form.$description((event.currentTarget as HTMLTextAreaElement).value)}
        placeholder={$t.descriptionPlaceholder}
        required
      ></textarea>
      {#if $errors.description}<small>{$t.errors?.description}</small>{/if}
    </label>

    <div class="form__row">
      <label class="field" for="event-starts-at">
        <span>{$t.startsAtLabel}</span>
        <input
          id="event-starts-at"
          name="startsAt"
          value={$startsAt}
          oninput={(event) => form.$startsAt((event.currentTarget as HTMLInputElement).value)}
          type="datetime-local"
          required
        />
        {#if $errors.startsAt}<small>{$t.errors?.startsAt}</small>{/if}
      </label>

      <label class="field" for="event-category">
        <span>{$t.categoryLabel}</span>
        <select
          id="event-category"
          name="category"
          value={$category}
          onchange={onCategory}
          required
        >
          {#each eventCategories as item}
            <option value={item}>{$t.categories?.[item]}</option>
          {/each}
        </select>
      </label>
    </div>

    <label class="field" for="event-location">
      <span>{$t.locationLabel}</span>
      <input
        id="event-location"
        name="location"
        value={$location}
        oninput={(event) => form.$location((event.currentTarget as HTMLInputElement).value)}
        type="text"
        placeholder={$t.locationPlaceholder}
        required
      />
      {#if $errors.location}<small>{$t.errors?.location}</small>{/if}
    </label>

    {#if $createError}
      <div class="notice notice_error">
        {$createError}
      </div>
    {/if}

    <button class="button" type="submit" disabled={!$valid || $loading}>
      {$loading ? $t.creating : $t.create}
    </button>
  </form>
</section>
