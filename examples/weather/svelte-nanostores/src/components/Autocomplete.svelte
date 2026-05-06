<script lang="ts">
  import type { City } from '../services/types.js'

  interface Props {
    id: string
    label: string
    name: string
    value: string
    suggestions: readonly City[]
    onChange(value: string): void
  }

  const FIRST_SUGGESTION = 0
  const props: Props = $props()
  let isOpen = $state(false)
  let activeIndex = $state(FIRST_SUGGESTION)
  const hasSuggestions = $derived(isOpen && props.suggestions.length > 0)

  function select(value: string) {
    props.onChange(value)
    isOpen = false
    activeIndex = FIRST_SUGGESTION
  }

  function handleInput(event: Event) {
    props.onChange((event.currentTarget as HTMLInputElement).value)
    isOpen = true
    activeIndex = FIRST_SUGGESTION
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      isOpen = true
      activeIndex = Math.min(activeIndex + 1, props.suggestions.length - 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      activeIndex = Math.max(activeIndex - 1, FIRST_SUGGESTION)
    } else if (event.key === 'Enter' && hasSuggestions) {
      event.preventDefault()
      select(props.suggestions[activeIndex].label)
    } else if (event.key === 'Escape') {
      isOpen = false
    }
  }
</script>

<div class="autocomplete">
  <label class="autocomplete-label" for={props.id}>
    {props.label}
  </label>
  <div class="autocomplete-control">
    <input
      aria-autocomplete="list"
      aria-controls={`${props.id}-suggestions`}
      aria-expanded={hasSuggestions}
      autocomplete="off"
      class="autocomplete-field"
      id={props.id}
      name={props.name}
      role="combobox"
      type="text"
      value={props.value}
      onblur={() => isOpen = false}
      onfocus={() => isOpen = true}
      oninput={handleInput}
      onkeydown={handleKeydown}
    />

    {#if hasSuggestions}
      <ul
        class="autocomplete-list"
        id={`${props.id}-suggestions`}
        role="listbox"
      >
        {#each props.suggestions as city, index (city.label)}
          <li role="presentation">
            <button
              aria-selected={index === activeIndex}
              class={index === activeIndex
                ? 'autocomplete-option autocomplete-option-active'
                : 'autocomplete-option'}
              role="option"
              type="button"
              onmousedown={(event) => event.preventDefault()}
              onclick={() => select(city.label)}
            >
              <span class="autocomplete-option-title">
                {city.name}
              </span>
              <span class="autocomplete-option-meta">
                {city.country}
              </span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
