<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import { Session$ } from '../../stores/session.js'

  export function Stores$() {
    const { $username: username } = inject(Session$)

    return [username]
  }
</script>

<script lang="ts">
  import { getInject } from '@nano_kit/svelte-kit'

  const {
    $username: username,
    login
  } = getInject(Session$)
  let input = $state('')

  function onSubmit(event: SubmitEvent) {
    event.preventDefault()

    login(input)
    input = ''
  }
</script>

<svelte:head>
  <title>Session Cookies | Nano Kit SSR</title>
  <meta
    name="description"
    content="Cookie-backed session demo rendered with Nano Kit SSR."
  />
</svelte:head>

<section class="session">
  <p class="eyebrow">Cookie SSR demo</p>
  <h1>Session state without hydration mismatch</h1>
  <p class="intro">
    The server reads the incoming cookie before rendering. The client hydrates the same session value.
  </p>

  {#if $username}
    <div class="panel" aria-live="polite">
      <p class="label">Active session</p>
      <strong>{$username}</strong>
      <a class="button" href="/logout" data-sveltekit-reload>
        Logout
      </a>
    </div>
  {:else}
    <form class="panel form" onsubmit={onSubmit}>
      <label for="username">
        Username
      </label>
      <input
        id="username"
        name="username"
        bind:value={input}
        autocomplete="username"
        required
      />
      <button type="submit">
        Start session
      </button>
    </form>
  {/if}
</section>
