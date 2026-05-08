<script module lang="ts">
  import { title } from '@nano_kit/svelte-router'

  export function Head$() {
    return [
      title('New event | Event Board')
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
  import { NewEventForm$ } from '#src/stores/events'

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
    <p class="eyebrow">New event</p>
    <h1>Create an event</h1>
    <p>
      Add an event to the in-memory API and open its public page.
    </p>
    <p class="shortcut-hint">
      Press Ctrl+M or Cmd+M to fill the form with sample data.
    </p>
  </div>

  <form class="form" onsubmit={onSubmit}>
    <label class="field" for="event-title">
      <span>Title</span>
      <input
        id="event-title"
        name="title"
        value={$titleValue}
        oninput={(event) => form.$title((event.currentTarget as HTMLInputElement).value)}
        type="text"
        placeholder="Frontend Meetup"
        required
      />
      {#if $errors.title}<small>{$errors.title}</small>{/if}
    </label>

    <label class="field" for="event-description">
      <span>Description</span>
      <textarea
        id="event-description"
        name="description"
        value={$description}
        oninput={(event) => form.$description((event.currentTarget as HTMLTextAreaElement).value)}
        placeholder="Short talks, demos, and hallway conversations."
        required
      ></textarea>
      {#if $errors.description}<small>{$errors.description}</small>{/if}
    </label>

    <div class="form__row">
      <label class="field" for="event-starts-at">
        <span>Date and time</span>
        <input
          id="event-starts-at"
          name="startsAt"
          value={$startsAt}
          oninput={(event) => form.$startsAt((event.currentTarget as HTMLInputElement).value)}
          type="datetime-local"
          required
        />
        {#if $errors.startsAt}<small>{$errors.startsAt}</small>{/if}
      </label>

      <label class="field" for="event-category">
        <span>Category</span>
        <select
          id="event-category"
          name="category"
          value={$category}
          onchange={onCategory}
          required
        >
          {#each eventCategories as item}
            <option value={item}>{item}</option>
          {/each}
        </select>
      </label>
    </div>

    <label class="field" for="event-location">
      <span>Location</span>
      <input
        id="event-location"
        name="location"
        value={$location}
        oninput={(event) => form.$location((event.currentTarget as HTMLInputElement).value)}
        type="text"
        placeholder="Online"
        required
      />
      {#if $errors.location}<small>{$errors.location}</small>{/if}
    </label>

    {#if $createError}
      <div class="notice notice_error">
        {$createError}
      </div>
    {/if}

    <button class="button" type="submit" disabled={!$valid || $loading}>
      {$loading ? 'Creating...' : 'Create event'}
    </button>
  </form>
</section>
