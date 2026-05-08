<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import { title } from '@nano_kit/svelte-router'
  import { Characters$ as CharactersStore$ } from '../../stores/characters.js'

  export function Head$() {
    return [
      title('Characters | Rick and Morty Wiki')
    ]
  }

  export function Stores$() {
    const { $characters: characters } = inject(CharactersStore$)

    return [characters]
  }
</script>

<script lang="ts">
  import { getInject } from '@nano_kit/svelte'
  import { Characters$ } from '../../stores/characters.js'
  import { Params$ } from '../../stores/router.js'
  import CharacterGrid from '../blocks/CharacterGrid.svelte'
  import Pagination from '../components/Pagination.svelte'
  import Spinner from '../components/Spinner.svelte'

  const {
    $characters: characters,
    $charactersError: charactersError,
    $charactersLoading: charactersLoading
  } = getInject(Characters$)
  const { $charactersPage: charactersPage } = getInject(Params$)
</script>

<section class="characters-container">
  {#if $charactersError}
    <div class="characters-error">
      <h2>Error loading characters</h2>
      <p>{$charactersError}</p>
    </div>
  {:else if $charactersLoading || !$characters}
    <Spinner>Loading characters...</Spinner>
  {:else}
    <CharacterGrid characters={$characters.items} />
    <Pagination
      current={$charactersPage}
      total={$characters.totalPages}
      label="Character pages navigation"
    />
  {/if}
</section>
