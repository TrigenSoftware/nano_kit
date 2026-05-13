<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import { Navigation$ } from '@nano_kit/svelte-kit'
  import { Session$ } from '../../stores/session.js'

  export function Stores$() {
    const navigation = inject(Navigation$)
    const { logout } = inject(Session$)

    logout()
    navigation.replace('/')

    return []
  }
</script>
