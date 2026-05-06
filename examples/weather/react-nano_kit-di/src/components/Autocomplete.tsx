import {
  useCallback,
  useState
} from 'react'
import type { City } from '../services/types.js'

interface AutocompleteProps {
  id: string
  label: string
  name: string
  value: string
  suggestions: City[]
  onChange(value: string): void
}

const FIRST_SUGGESTION = 0

interface AutocompleteOptionProps {
  city: City
  isActive: boolean
  onSelect(value: string): void
}

function AutocompleteOption({
  city,
  isActive,
  onSelect
}: AutocompleteOptionProps) {
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault(),
    []
  )
  const handleClick = useCallback(
    () => onSelect(city.label),
    [
      city.label,
      onSelect
    ]
  )

  return (
    <li role='presentation'>
      <button
        aria-selected={isActive}
        className={isActive
          ? 'autocomplete-option autocomplete-option-active'
          : 'autocomplete-option'}
        role='option'
        type='button'
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      >
        <span className='autocomplete-option-title'>
          {city.name}
        </span>
        <span className='autocomplete-option-meta'>
          {city.country}
        </span>
      </button>
    </li>
  )
}

export function Autocomplete({
  id,
  label,
  name,
  onChange,
  suggestions,
  value
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(FIRST_SUGGESTION)
  const hasSuggestions = isOpen && suggestions.length > 0
  const select = useCallback((nextValue: string) => {
    onChange(nextValue)
    setIsOpen(false)
    setActiveIndex(FIRST_SUGGESTION)
  }, [onChange])
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
    setIsOpen(true)
    setActiveIndex(FIRST_SUGGESTION)
  }, [onChange])
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex(index => Math.min(index + 1, suggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(index => Math.max(index - 1, FIRST_SUGGESTION))
    } else if (event.key === 'Enter' && hasSuggestions) {
      event.preventDefault()
      select(suggestions[activeIndex].label)
    } else if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }, [
    activeIndex,
    hasSuggestions,
    select,
    suggestions
  ])
  const handleBlur = useCallback(
    () => setIsOpen(false),
    []
  )
  const handleFocus = useCallback(
    () => setIsOpen(true),
    []
  )

  return (
    <div className='autocomplete'>
      <label
        className='autocomplete-label'
        htmlFor={id}
      >
        {label}
      </label>
      <div className='autocomplete-control'>
        <input
          aria-autocomplete='list'
          aria-controls={`${id}-suggestions`}
          aria-expanded={hasSuggestions}
          autoComplete='off'
          className='autocomplete-field'
          id={id}
          name={name}
          role='combobox'
          type='text'
          value={value}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />
        {hasSuggestions && (
          <ul
            className='autocomplete-list'
            id={`${id}-suggestions`}
            role='listbox'
          >
            {suggestions.map((city, index) => (
              <AutocompleteOption
                key={city.label}
                city={city}
                isActive={index === activeIndex}
                onSelect={select}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
