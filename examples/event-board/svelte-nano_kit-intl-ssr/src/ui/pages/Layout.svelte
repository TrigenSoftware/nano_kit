<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import {
    lang,
    meta,
    title
  } from '@nano_kit/svelte-router'
  import { Intl$ } from '#src/stores/intl'
  import { User$ } from '#src/stores/user'

  function Messages$() {
    const { messages } = inject(Intl$)

    return messages('layout')
  }

  export function Stores$() {
    const [t] = inject(Messages$)
    const { $user: user } = inject(User$)

    return [t, user]
  }

  export function Head$() {
    const { $locale: locale } = inject(Intl$)
    const [t] = inject(Messages$)

    return [
      lang(locale),
      title(t.$title),
      meta({
        charSet: 'utf-8'
      }),
      meta({
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      })
    ]
  }
</script>

<script lang="ts">
  import { getInject } from '@nano_kit/svelte'
  import {
    Link,
    Outlet,
    enableLinkComponentAriaCurrent,
    enableLinkComponentPreload,
    syncHead
  } from '@nano_kit/svelte-router'

  const {
    $locale: locale,
    $loading: loading,
    supportedLocales
  } = getInject(Intl$)
  const {
    $user: user,
    logout
  } = getInject(User$)
  const [t] = getInject(Messages$)

  function onLogout() {
    logout()
  }

  syncHead()
  enableLinkComponentPreload(true)
  enableLinkComponentAriaCurrent()
</script>

<div class="app">
  <header class="header">
    <div class="container header__inner">
      <Link to="home" class="brand">{$t.title}</Link>

      <nav class="nav">
        <Link to="home">{$t.events}</Link>
        <Link to="newEvent">{$t.newEvent}</Link>
      </nav>

      <div class="header__user">
        {#if $user}
          <strong>{$user.name}</strong>
          <button class="button_link" type="button" onclick={onLogout}>
            {$t.logout}
          </button>
        {:else}
          <Link to="login">{$t.login}</Link>
        {/if}
      </div>
    </div>
  </header>

  <main class="container main">
    <Outlet />
  </main>

  <footer class="footer">
    <div class="container footer__inner">
      <div class="locale-field">
        <span>{$t.language}</span>

        <div class="locale-switcher" role="group" aria-label={$t.language}>
          {#each supportedLocales as supportedLocale (supportedLocale)}
            <button
              class="locale-switcher__button"
              type="button"
              aria-pressed={$locale === supportedLocale}
              onclick={() => locale(supportedLocale)}
            >
              {supportedLocale.toUpperCase()}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </footer>

  {#if $loading}
    <div class="loading-overlay" role="status" aria-live="polite">
      <div class="loading-overlay__content">
        <span class="loading-overlay__spinner" aria-hidden="true"></span>
        <span>{$t.loading}</span>
      </div>
    </div>
  {/if}
</div>
