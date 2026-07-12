<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import {
    Navigation$,
    Paths$
  } from '@nano_kit/svelte-kit'
  import { Session$ } from '../../stores/session.js'

  export function Stores$() {
    const navigation = inject(Navigation$)
    const paths = inject(Paths$)
    const { logout } = inject(Session$)

    logout()
    navigation.replace(paths.home)

    return []
  }
</script>
