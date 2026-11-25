<script lang="ts">
  import { getInject } from '@nano_kit/svelte'
  import {
    OtherValue$,
    Value$
  } from './request-values.js'

  const value = getInject(Value$)
  const otherValue = getInject(OtherValue$)
</script>

<div>{value} {otherValue}</div>
