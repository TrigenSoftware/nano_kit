import {
  type WritableSignal,
  effect
} from 'kida'
import {
  valueProperty,
  checkedProperty,
  indeterminateProperty,
  optionsProperty,
  multipleProperty,
  selectedProperty,
  onChangeEvent,
  onInputEvent,
  createEffectAttribute
} from '../internals/index.js'

// https://caniuse.com/?search=oninput onInput doesn't fire an input event when (un)checking a checkbox or radio button, or when changing the selected file(s) of an <input type="file">

export const Indeterminate = Symbol.for('Indeterminate')

type Value = WritableSignal<string>

type CheckedPrimitive = boolean | typeof Indeterminate

type Checked = WritableSignal<boolean> | WritableSignal<CheckedPrimitive>

type SelectedPrimitive = string | string[]

type Selected = WritableSignal<string> | WritableSignal<string[]> | WritableSignal<SelectedPrimitive>

type Files = WritableSignal<File[]>

type TextboxElement = HTMLInputElement | HTMLTextAreaElement

type CheckboxElement = HTMLInputElement

type ComboboxElement = HTMLSelectElement

type FileElement = HTMLInputElement

function createElementPropertySetter<E extends Element, V>(
  eventName: string,
  getValue: (control: E) => V,
  setValue: (control: E, value: V) => void
) {
  return (
    control: E,
    $value: WritableSignal<V>
  ): void => {
    setValue(control, $value())

    effect(() => {
      setValue(control, $value())
    })

    effect(() => {
      const eventListener = () => $value(getValue(control))

      control.addEventListener(eventName, eventListener)

      return () => control.removeEventListener(eventName, eventListener)
    })
  }
}

function setValue(
  control: TextboxElement,
  value: string
) {
  control[valueProperty] = value
}

function getValue(control: TextboxElement) {
  return control[valueProperty]
}

/**
 * Effect attribute to set and read text value of input element
 */
export const value$ = /* @__PURE__ */ createEffectAttribute<'value$', TextboxElement, Value>(
  'value$',
  createElementPropertySetter(
    onInputEvent,
    getValue,
    setValue
  )
)

function setChecked(
  control: CheckboxElement,
  value: CheckedPrimitive
) {
  if (value === Indeterminate) {
    control[indeterminateProperty] = true
  } else {
    control[indeterminateProperty] = false
    control.checked = value
  }
}

function getChecked(control: CheckboxElement): CheckedPrimitive {
  return control[indeterminateProperty] ? Indeterminate : control[checkedProperty]
}

/**
 * Effect attribute to set and read checked value of checkbox or radio button element
 */
export const checked$ = /* @__PURE__ */ createEffectAttribute<'checked$', CheckboxElement, WritableSignal<CheckedPrimitive>>(
  'checked$',
  createElementPropertySetter(
    onChangeEvent,
    getChecked,
    setChecked
  )
)

function setSelected(
  control: ComboboxElement,
  values: SelectedPrimitive
) {
  const options = control[optionsProperty]
  const len = options.length
  const isArray = Array.isArray(values)
  const test = isArray
    ? (v: string) => values.includes(v)
    : (v: string) => values === v

  control.multiple = isArray

  if (len) {
    for (let i = 0, option: HTMLOptionElement; i < len; i++) {
      option = options[i]
      option[selectedProperty] = test(option[valueProperty])
    }
  }
}

function getSelected(control: ComboboxElement): SelectedPrimitive {
  const isMultiple = control[multipleProperty]
  const options = control[optionsProperty]
  const len = options.length
  const values: string[] = []

  if (len) {
    for (let i = 0, option: HTMLOptionElement; i < len; i++) {
      option = options[i]

      if (option[selectedProperty]) {
        if (isMultiple) {
          values.push(option[valueProperty])
        } else {
          return option[valueProperty]
        }
      }
    }
  }

  return values
}

/**
 * Effect attribute to set and read selected value of combobox element
 */
export const selected$ = /* @__PURE__ */ createEffectAttribute<'selected$', ComboboxElement, WritableSignal<SelectedPrimitive>>(
  'selected$',
  createElementPropertySetter(
    onChangeEvent,
    getSelected,
    setSelected
  )
)

function filesEffectAttribute(
  control: FileElement,
  $value: Files
) {
  effect(() => {
    const eventListener = () => $value(Array.from(control.files!))

    control.addEventListener(onChangeEvent, eventListener)

    return () => control.removeEventListener(onChangeEvent, eventListener)
  })
}

/**
 * Effect attribute to read files of file input element
 */
export const files$ = /* @__PURE__ */ createEffectAttribute<'files$', FileElement, Files>(
  'files$',
  filesEffectAttribute
)

declare module 'nanoviews' {
  interface EffectAttributeValues {
    value$: Value
    checked$: Checked
    selected$: Selected
    files$: Files
  }

  interface EffectAttributeTargets {
    value$: TextboxElement
    checked$: CheckboxElement
    selected$: ComboboxElement
    files$: FileElement
  }
}
