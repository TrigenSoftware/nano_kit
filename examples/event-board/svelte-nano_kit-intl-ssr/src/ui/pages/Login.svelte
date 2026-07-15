<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import { title } from '@nano_kit/svelte-router'
  import {
    match,
    other
  } from '@nano_kit/intl'
  import { UserError } from '#src/services/user'
  import { User$ } from '#src/stores/user'
  import { Intl$ } from '#src/stores/intl'

  function Messages$() {
    const { messages } = inject(Intl$)

    return messages('login', {
      errors: match('type', other(UserError.LoginFailed))
    })
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
  import { getInject } from '@nano_kit/svelte'

  const {
    login,
    $loginError: loginError,
    $loginLoading: loginLoading
  } = getInject(User$)
  const [t] = getInject(Messages$)

  function onSubmit(event: SubmitEvent) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const username = formData.get('username')
    const password = formData.get('password')

    login({
      username: typeof username === 'string' ? username : '',
      password: typeof password === 'string' ? password : ''
    })
  }
</script>

<section class="page">
  <div class="page__header">
    <p class="eyebrow">{$t.eyebrow}</p>
    <h1>{$t.title}</h1>
    <p>
      {$t.description}
    </p>
    <p class="shortcut-hint">
      {$t.demoHint}
    </p>
  </div>

  <form class="form" onsubmit={onSubmit}>
    <label class="field" for="login-username">
      <span>{$t.usernameLabel}</span>
      <input
        id="login-username"
        name="username"
        type="text"
        autocomplete="username"
        required
      />
    </label>

    <label class="field" for="login-password">
      <span>{$t.passwordLabel}</span>
      <input
        id="login-password"
        name="password"
        type="password"
        autocomplete="current-password"
        required
      />
    </label>

    {#if $loginError}
      <div class="notice notice_error">
        {$t.errors($loginError)}
      </div>
    {/if}

    <button class="button" type="submit" disabled={$loginLoading}>
      {$loginLoading ? $t.submitting : $t.submit}
    </button>
  </form>
</section>
