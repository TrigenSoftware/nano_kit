<script lang="ts">
  import type {
    Injectable,
    InjectionProvider
  } from '@nano_kit/store'
  import {
    getInject,
    setInjectionContext
  } from '../src/core.js'

  interface Props<T> {
    context: InjectionProvider[]
    token: Injectable<T>
    onValue(value: T): void
  }

  const props: Props<unknown> = $props()

  // svelte-ignore state_referenced_locally
  setInjectionContext(props.context)
  // svelte-ignore state_referenced_locally
  props.onValue(getInject(props.token))
</script>
