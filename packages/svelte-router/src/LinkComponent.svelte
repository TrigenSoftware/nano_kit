<script
  lang="ts"
  generics="R extends Routes, K extends keyof R & string"
>
  import {
    type Paths,
    type Routes
  } from '@nano_kit/router'
  import { isFunction } from '@nano_kit/store'
  import { toStore } from 'svelte/store'
  import type {
    LinkProps,
    LinkSettings
  } from './link.types.js'

  type Props = LinkProps<R, K> & {
    paths: Paths<R>
    settings: LinkSettings
  }

  const {
    onclick: onClickProp,
    children,
    paths,
    settings,
    ...inputHookProps
  }: Props = $props()
  // svelte-ignore state_referenced_locally
  const {
    onClick,
    hook
  } = settings
  const {
    to,
    params,
    href: hrefProp,
    preload,
    ...elementProps
  } = $derived(inputHookProps)
  const path = $derived(to && paths[to]) as string | ((params: unknown) => string) | undefined
  const href = $derived(
    hrefProp ?? (path && (
      isFunction(path)
        ? path(params)
        : path))
  )
  // svelte-ignore state_referenced_locally
  const outputHookProps = hook(
    toStore(() => ({
      href,
      ...inputHookProps
    })),
    settings
  )
  const onClickCallback = (event: MouseEvent & { currentTarget: HTMLAnchorElement }) => {
    onClickProp?.(event)

    if (!event.defaultPrevented) {
      onClick(event)
    }
  }
</script>

<a
  href={href}
  onclick={onClickCallback}
  {...elementProps}
  {...$outputHookProps}
>
  {#if children}
    {@render children()}
  {/if}
</a>
