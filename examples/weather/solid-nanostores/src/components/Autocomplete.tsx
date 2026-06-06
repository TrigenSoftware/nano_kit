import {
  For,
  Show,
  createSignal
} from 'solid-js'
import type { City } from '../services/types.js'

interface AutocompleteProps {
  id: string
  label: string
  name: string
  value: string
  suggestions: City[]
  onChange: (value: string) => void
}

const FIRST_SUGGESTION = 0

export function Autocomplete(props: AutocompleteProps) {
  const [isOpen, setIsOpen] = createSignal(false)
  const [activeIndex, setActiveIndex] = createSignal(FIRST_SUGGESTION)
  const hasSuggestions = () => isOpen() && props.suggestions.length > 0
  const select = (nextValue: string) => {
    props.onChange(nextValue)
    setIsOpen(false)
    setActiveIndex(FIRST_SUGGESTION)
  }
  const handleInput = (event: InputEvent & {
    currentTarget: HTMLInputElement
  }) => {
    props.onChange(event.currentTarget.value)
    setIsOpen(true)
    setActiveIndex(FIRST_SUGGESTION)
  }
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex(index => Math.min(index + 1, props.suggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(index => Math.max(index - 1, FIRST_SUGGESTION))
    } else if (event.key === 'Enter' && hasSuggestions()) {
      event.preventDefault()
      select(props.suggestions[activeIndex()].label)
    } else if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div class='autocomplete'>
      <label
        class='autocomplete-label'
        for={props.id}
      >
        {props.label}
      </label>
      <div class='autocomplete-control'>
        <input
          aria-autocomplete='list'
          aria-controls={`${props.id}-suggestions`}
          aria-expanded={hasSuggestions()}
          autocomplete='off'
          class='autocomplete-field'
          id={props.id}
          name={props.name}
          role='combobox'
          type='text'
          value={props.value}
          onBlur={() => setIsOpen(false)}
          onFocus={() => setIsOpen(true)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
        <Show when={hasSuggestions()}>
          <ul
            class='autocomplete-list'
            id={`${props.id}-suggestions`}
            role='listbox'
          >
            <For each={props.suggestions}>
              {(city, index) => (
                <li role='presentation'>
                  <button
                    aria-selected={index() === activeIndex()}
                    class={index() === activeIndex()
                      ? 'autocomplete-option autocomplete-option-active'
                      : 'autocomplete-option'}
                    role='option'
                    type='button'
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => select(city.label)}
                  >
                    <span class='autocomplete-option-title'>
                      {city.name}
                    </span>
                    <span class='autocomplete-option-meta'>
                      {city.country}
                    </span>
                  </button>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </div>
  )
}
