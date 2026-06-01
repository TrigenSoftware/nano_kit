<script lang="ts">
  import type {
    InjectionToken,
    InjectionProvider
  } from '@nano_kit/store'
  import {
    getInject,
    isolate,
    setInjector
  } from '../src/core.js'

  interface Props<T> {
    injector: InjectionProvider[]
    token: InjectionToken<T>
    onValue(value: T): void
  }

  const props: Props<unknown> = $props()

  // svelte-ignore state_referenced_locally
  setInjector(props.injector)
  isolate()
  // svelte-ignore state_referenced_locally
  props.onValue(getInject(props.token))
</script>
