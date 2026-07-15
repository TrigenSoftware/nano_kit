<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import { title } from '@nano_kit/svelte-router'
  import { Intl$ } from '#src/stores/intl'

  function Messages$() {
    const { messages } = inject(Intl$)

    return messages('notFound')
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
  import { Link } from '@nano_kit/svelte-router'

  const [t] = getInject(Messages$)
</script>

<section class="page">
  <div class="page__header">
    <p class="eyebrow">{$t.eyebrow}</p>
    <h1>{$t.title}</h1>
    <p>
      {$t.description}
    </p>
  </div>

  <Link class="button button_secondary" to="home">
    {$t.backToEvents}
  </Link>
</section>
