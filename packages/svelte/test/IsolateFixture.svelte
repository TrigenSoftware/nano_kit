<script lang="ts">
  import type {
    InjectionFactory,
    InjectionProvider
  } from '@nano_kit/store'
  import {
    inject,
    isolate,
    setInjectionContext
  } from '../src/core.js'

  interface Props<T> {
    context: InjectionProvider[]
    token: InjectionFactory<T>
    onValue(value: T): void
  }

  const props: Props<unknown> = $props()

  // svelte-ignore state_referenced_locally
  setInjectionContext(props.context)
  isolate()
  // svelte-ignore state_referenced_locally
  props.onValue(inject(props.token))
</script>
