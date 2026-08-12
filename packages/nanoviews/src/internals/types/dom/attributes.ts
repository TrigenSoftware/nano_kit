import type * as CSS from 'csstype'
import type { ValueOrAccessor } from 'kida'
import type { EmptyValue } from '../common.js'
import type {
  Booleanish,
  CrossOrigin
} from './common.js'
import type {
  AriaRole,
  AriaAttributes
} from './aria.js'
import type {
  DOMAttributes,
  TargetEventHandler,
  ChangeEventHandler
} from './events.js'

export interface CSSProperties extends CSS.Properties<string | number> {
  /**
   * Custom properties are the only open part of the typing: every other name
   * is checked against CSSType. You're able to use type assertion or module
   * augmentation to add properties of your own.
   *
   * For examples and more information, visit:
   * https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
   */
  [name: `--${string}`]: string | number | undefined
}

export interface HTMLAttributes<T extends Node = Node> extends AriaAttributes, DOMAttributes<T> {
  // React-specific Attributes
  defaultChecked?: ValueOrAccessor<boolean | EmptyValue>
  defaultValue?: ValueOrAccessor<string | number | readonly string[] | EmptyValue>
  suppressContentEditableWarning?: ValueOrAccessor<boolean | EmptyValue>
  suppressHydrationWarning?: ValueOrAccessor<boolean | EmptyValue>

  // Standard HTML Attributes
  accessKey?: ValueOrAccessor<string | EmptyValue>
  autoFocus?: ValueOrAccessor<boolean | EmptyValue>
  class?: ValueOrAccessor<string | EmptyValue>
  contentEditable?: ValueOrAccessor<Booleanish | 'inherit' | 'plaintext-only' | EmptyValue>
  contextMenu?: ValueOrAccessor<string | EmptyValue>
  dir?: ValueOrAccessor<string | EmptyValue>
  draggable?: ValueOrAccessor<Booleanish | EmptyValue>
  hidden?: ValueOrAccessor<boolean | EmptyValue>
  id?: ValueOrAccessor<string | EmptyValue>
  lang?: ValueOrAccessor<string | EmptyValue>
  nonce?: ValueOrAccessor<string | EmptyValue>
  slot?: ValueOrAccessor<string | EmptyValue>
  spellCheck?: ValueOrAccessor<Booleanish | EmptyValue>
  style?: ValueOrAccessor<string | EmptyValue>
  tabIndex?: ValueOrAccessor<number | EmptyValue>
  title?: ValueOrAccessor<string | EmptyValue>
  translate?: ValueOrAccessor<'yes' | 'no' | EmptyValue>

  // Unknown
  radioGroup?: ValueOrAccessor<string | EmptyValue> // <command>, <menuitem>

  // WAI-ARIA
  role?: ValueOrAccessor<AriaRole | EmptyValue>

  // RDFa Attributes
  about?: ValueOrAccessor<string | EmptyValue>
  content?: ValueOrAccessor<string | EmptyValue>
  datatype?: ValueOrAccessor<string | EmptyValue>
  inlist?: ValueOrAccessor<any>
  prefix?: ValueOrAccessor<string | EmptyValue>
  property?: ValueOrAccessor<string | EmptyValue>
  rel?: ValueOrAccessor<string | EmptyValue>
  resource?: ValueOrAccessor<string | EmptyValue>
  rev?: ValueOrAccessor<string | EmptyValue>
  typeof?: ValueOrAccessor<string | EmptyValue>
  vocab?: ValueOrAccessor<string | EmptyValue>

  // Non-standard Attributes
  autoCapitalize?: ValueOrAccessor<string | EmptyValue>
  autoCorrect?: ValueOrAccessor<string | EmptyValue>
  autoSave?: ValueOrAccessor<string | EmptyValue>
  color?: ValueOrAccessor<string | EmptyValue>
  itemProp?: ValueOrAccessor<string | EmptyValue>
  itemScope?: ValueOrAccessor<boolean | EmptyValue>
  itemType?: ValueOrAccessor<string | EmptyValue>
  itemID?: ValueOrAccessor<string | EmptyValue>
  itemRef?: ValueOrAccessor<string | EmptyValue>
  results?: ValueOrAccessor<number | EmptyValue>
  security?: ValueOrAccessor<string | EmptyValue>
  unselectable?: ValueOrAccessor<'on' | 'off' | EmptyValue>

  // Living Standard
  /**
   * Hints at the type of data that might be entered by the user while editing the element or its contents
   * @see {@link https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute}
   */
  inputMode?: ValueOrAccessor<'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | EmptyValue>
  /**
   * Specify that a standard HTML element should behave like a defined custom built-in element
   * @see {@link https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is}
   */
  is?: ValueOrAccessor<string | EmptyValue>

  /**
   * Data attributes
   */
  [key: `data-${string}`]: ValueOrAccessor<unknown>
}

export type HTMLAttributeReferrerPolicy =
  | ''
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url'

export type HTMLAttributeAnchorTarget =
  | '_self'
  | '_blank'
  | '_parent'
  | '_top'
  | string & {}

export interface AnchorHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  download?: ValueOrAccessor<any>
  href?: ValueOrAccessor<string | EmptyValue>
  hrefLang?: ValueOrAccessor<string | EmptyValue>
  media?: ValueOrAccessor<string | EmptyValue>
  ping?: ValueOrAccessor<string | EmptyValue>
  target?: ValueOrAccessor<HTMLAttributeAnchorTarget | EmptyValue>
  type?: ValueOrAccessor<string | EmptyValue>
  referrerPolicy?: ValueOrAccessor<HTMLAttributeReferrerPolicy | EmptyValue>
}

export interface AudioHTMLAttributes<T extends HTMLElement> extends MediaHTMLAttributes<T> {}

export interface AreaHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  alt?: ValueOrAccessor<string | EmptyValue>
  coords?: ValueOrAccessor<string | EmptyValue>
  download?: ValueOrAccessor<any>
  href?: ValueOrAccessor<string | EmptyValue>
  hrefLang?: ValueOrAccessor<string | EmptyValue>
  media?: ValueOrAccessor<string | EmptyValue>
  referrerPolicy?: ValueOrAccessor<HTMLAttributeReferrerPolicy | EmptyValue>
  shape?: ValueOrAccessor<string | EmptyValue>
  target?: ValueOrAccessor<string | EmptyValue>
}

export interface BaseHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  href?: ValueOrAccessor<string | EmptyValue>
  target?: ValueOrAccessor<string | EmptyValue>
}

export interface BlockquoteHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  cite?: ValueOrAccessor<string | EmptyValue>
}

export interface ButtonHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  disabled?: ValueOrAccessor<boolean | EmptyValue>
  form?: ValueOrAccessor<string | EmptyValue>
  formAction?: ValueOrAccessor<string | EmptyValue>
  formEncType?: ValueOrAccessor<string | EmptyValue>
  formMethod?: ValueOrAccessor<string | EmptyValue>
  formNoValidate?: ValueOrAccessor<boolean | EmptyValue>
  formTarget?: ValueOrAccessor<string | EmptyValue>
  name?: ValueOrAccessor<string | EmptyValue>
  type?: ValueOrAccessor<'submit' | 'reset' | 'button' | EmptyValue>
  value?: ValueOrAccessor<string | readonly string[] | number | EmptyValue>
}

export interface CanvasHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  height?: ValueOrAccessor<number | string | EmptyValue>
  width?: ValueOrAccessor<number | string | EmptyValue>
}

export interface ColHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  span?: ValueOrAccessor<number | EmptyValue>
  width?: ValueOrAccessor<number | string | EmptyValue>
}

export interface ColgroupHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  span?: ValueOrAccessor<number | EmptyValue>
}

export interface DataHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  value?: ValueOrAccessor<string | readonly string[] | number | EmptyValue>
}

export interface DetailsHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  open?: ValueOrAccessor<boolean | EmptyValue>
  onToggle?: TargetEventHandler<T> | EmptyValue
  name?: ValueOrAccessor<string | EmptyValue>
}

export interface DelHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  cite?: ValueOrAccessor<string | EmptyValue>
  dateTime?: ValueOrAccessor<string | EmptyValue>
}

export interface DialogHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  onCancel?: TargetEventHandler<T> | EmptyValue
  onClose?: TargetEventHandler<T> | EmptyValue
  open?: ValueOrAccessor<boolean | EmptyValue>
}

export interface EmbedHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  height?: ValueOrAccessor<number | string | EmptyValue>
  src?: ValueOrAccessor<string | EmptyValue>
  type?: ValueOrAccessor<string | EmptyValue>
  width?: ValueOrAccessor<number | string | EmptyValue>
}

export interface FieldsetHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  disabled?: ValueOrAccessor<boolean | EmptyValue>
  form?: ValueOrAccessor<string | EmptyValue>
  name?: ValueOrAccessor<string | EmptyValue>
}

export interface FormHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  acceptCharset?: ValueOrAccessor<string | EmptyValue>
  action?: ValueOrAccessor<string | EmptyValue>
  autoComplete?: ValueOrAccessor<string | EmptyValue>
  encType?: ValueOrAccessor<string | EmptyValue>
  method?: ValueOrAccessor<string | EmptyValue>
  name?: ValueOrAccessor<string | EmptyValue>
  noValidate?: ValueOrAccessor<boolean | EmptyValue>
  target?: ValueOrAccessor<string | EmptyValue>
}

export interface HtmlHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  manifest?: ValueOrAccessor<string | EmptyValue>
}

export interface IframeHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  allow?: ValueOrAccessor<string | EmptyValue>
  allowFullScreen?: ValueOrAccessor<boolean | EmptyValue>
  allowTransparency?: ValueOrAccessor<boolean | EmptyValue>
  /** @deprecated */
  frameBorder?: ValueOrAccessor<number | string | EmptyValue>
  height?: ValueOrAccessor<number | string | EmptyValue>
  loading?: ValueOrAccessor<'eager' | 'lazy' | EmptyValue>
  /** @deprecated */
  marginHeight?: ValueOrAccessor<number | EmptyValue>
  /** @deprecated */
  marginWidth?: ValueOrAccessor<number | EmptyValue>
  name?: ValueOrAccessor<string | EmptyValue>
  referrerPolicy?: ValueOrAccessor<HTMLAttributeReferrerPolicy | EmptyValue>
  sandbox?: ValueOrAccessor<string | EmptyValue>
  /** @deprecated */
  scrolling?: ValueOrAccessor<string | EmptyValue>
  seamless?: ValueOrAccessor<boolean | EmptyValue>
  src?: ValueOrAccessor<string | EmptyValue>
  srcDoc?: ValueOrAccessor<string | EmptyValue>
  width?: ValueOrAccessor<number | string | EmptyValue>
}

export interface ImgHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  alt?: ValueOrAccessor<string | EmptyValue>
  crossOrigin?: ValueOrAccessor<CrossOrigin>
  decoding?: ValueOrAccessor<'async' | 'auto' | 'sync' | EmptyValue>
  fetchPriority?: ValueOrAccessor<'high' | 'low' | 'auto'>
  height?: ValueOrAccessor<number | string | EmptyValue>
  loading?: ValueOrAccessor<'eager' | 'lazy' | EmptyValue>
  referrerPolicy?: ValueOrAccessor<HTMLAttributeReferrerPolicy | EmptyValue>
  sizes?: ValueOrAccessor<string | EmptyValue>
  src?: ValueOrAccessor<string | EmptyValue>
  srcSet?: ValueOrAccessor<string | EmptyValue>
  useMap?: ValueOrAccessor<string | EmptyValue>
  width?: ValueOrAccessor<number | string | EmptyValue>
}

export interface InsHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  cite?: ValueOrAccessor<string | EmptyValue>
  dateTime?: ValueOrAccessor<string | EmptyValue>
}

export type HTMLInputTypeAttribute =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week'
  | string & {}

export type AutoFillAddressKind = 'billing' | 'shipping'
export type AutoFillBase = '' | 'off' | 'on'
export type AutoFillContactField =
  | 'email'
  | 'tel'
  | 'tel-area-code'
  | 'tel-country-code'
  | 'tel-extension'
  | 'tel-local'
  | 'tel-local-prefix'
  | 'tel-local-suffix'
  | 'tel-national'
export type AutoFillContactKind = 'home' | 'mobile' | 'work'
export type AutoFillCredentialField = 'webauthn'
export type AutoFillNormalField =
  | 'additional-name'
  | 'address-level1'
  | 'address-level2'
  | 'address-level3'
  | 'address-level4'
  | 'address-line1'
  | 'address-line2'
  | 'address-line3'
  | 'bday-day'
  | 'bday-month'
  | 'bday-year'
  | 'cc-csc'
  | 'cc-exp'
  | 'cc-exp-month'
  | 'cc-exp-year'
  | 'cc-family-name'
  | 'cc-given-name'
  | 'cc-name'
  | 'cc-number'
  | 'cc-type'
  | 'country'
  | 'country-name'
  | 'current-password'
  | 'family-name'
  | 'given-name'
  | 'honorific-prefix'
  | 'honorific-suffix'
  | 'name'
  | 'new-password'
  | 'one-time-code'
  | 'organization'
  | 'postal-code'
  | 'street-address'
  | 'transaction-amount'
  | 'transaction-currency'
  | 'username'
export type OptionalPrefixToken<T extends string> = `${T} ` | ''
export type OptionalPostfixToken<T extends string> = ` ${T}` | ''
export type AutoFillField = AutoFillNormalField | `${OptionalPrefixToken<AutoFillContactKind>}${AutoFillContactField}`
export type AutoFillSection = `section-${string}`
export type AutoFill =
  | AutoFillBase
  | `${OptionalPrefixToken<AutoFillSection>}${OptionalPrefixToken<
      AutoFillAddressKind
  >}${AutoFillField}${OptionalPostfixToken<AutoFillCredentialField>}`
export type HTMLInputAutoCompleteAttribute = AutoFill | string & {}

export interface InputHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  accept?: ValueOrAccessor<string | EmptyValue>
  alt?: ValueOrAccessor<string | EmptyValue>
  autoComplete?: ValueOrAccessor<HTMLInputAutoCompleteAttribute | EmptyValue>
  capture?: ValueOrAccessor<boolean | 'user' | 'environment' | EmptyValue> // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
  checked?: ValueOrAccessor<boolean | EmptyValue>
  disabled?: ValueOrAccessor<boolean | EmptyValue>
  enterKeyHint?: ValueOrAccessor<'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | EmptyValue>
  form?: ValueOrAccessor<string | EmptyValue>
  formAction?: ValueOrAccessor<string | EmptyValue>
  formEncType?: ValueOrAccessor<string | EmptyValue>
  formMethod?: ValueOrAccessor<string | EmptyValue>
  formNoValidate?: ValueOrAccessor<boolean | EmptyValue>
  formTarget?: ValueOrAccessor<string | EmptyValue>
  height?: ValueOrAccessor<number | string | EmptyValue>
  list?: ValueOrAccessor<string | EmptyValue>
  max?: ValueOrAccessor<number | string | EmptyValue>
  maxLength?: ValueOrAccessor<number | EmptyValue>
  min?: ValueOrAccessor<number | string | EmptyValue>
  minLength?: ValueOrAccessor<number | EmptyValue>
  multiple?: ValueOrAccessor<boolean | EmptyValue>
  name?: ValueOrAccessor<string | EmptyValue>
  pattern?: ValueOrAccessor<string | EmptyValue>
  placeholder?: ValueOrAccessor<string | EmptyValue>
  readOnly?: ValueOrAccessor<boolean | EmptyValue>
  required?: ValueOrAccessor<boolean | EmptyValue>
  size?: ValueOrAccessor<number | EmptyValue>
  src?: ValueOrAccessor<string | EmptyValue>
  step?: ValueOrAccessor<number | string | EmptyValue>
  type?: ValueOrAccessor<HTMLInputTypeAttribute | EmptyValue>
  value?: ValueOrAccessor<string | readonly string[] | number | EmptyValue>
  width?: ValueOrAccessor<number | string | EmptyValue>

  onChange?: ChangeEventHandler<T> | undefined
}

export interface KeygenHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  challenge?: ValueOrAccessor<string | EmptyValue>
  disabled?: ValueOrAccessor<boolean | EmptyValue>
  form?: ValueOrAccessor<string | EmptyValue>
  keyType?: ValueOrAccessor<string | EmptyValue>
  keyParams?: ValueOrAccessor<string | EmptyValue>
  name?: ValueOrAccessor<string | EmptyValue>
}

export interface LabelHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  form?: ValueOrAccessor<string | EmptyValue>
  for?: ValueOrAccessor<string | EmptyValue>
}

export interface LiHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  value?: ValueOrAccessor<string | readonly string[] | number | EmptyValue>
}

export interface LinkHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  as?: ValueOrAccessor<string | EmptyValue>
  crossOrigin?: ValueOrAccessor<CrossOrigin>
  fetchPriority?: ValueOrAccessor<'high' | 'low' | 'auto'>
  href?: ValueOrAccessor<string | EmptyValue>
  hrefLang?: ValueOrAccessor<string | EmptyValue>
  integrity?: ValueOrAccessor<string | EmptyValue>
  media?: ValueOrAccessor<string | EmptyValue>
  imageSrcSet?: ValueOrAccessor<string | EmptyValue>
  imageSizes?: ValueOrAccessor<string | EmptyValue>
  referrerPolicy?: ValueOrAccessor<HTMLAttributeReferrerPolicy | EmptyValue>
  sizes?: ValueOrAccessor<string | EmptyValue>
  type?: ValueOrAccessor<string | EmptyValue>
  charSet?: ValueOrAccessor<string | EmptyValue>
}

export interface MapHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  name?: ValueOrAccessor<string | EmptyValue>
}

export interface MenuHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  type?: ValueOrAccessor<string | EmptyValue>
}

export interface MediaHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  autoPlay?: ValueOrAccessor<boolean | EmptyValue>
  controls?: ValueOrAccessor<boolean | EmptyValue>
  controlsList?: ValueOrAccessor<string | EmptyValue>
  crossOrigin?: ValueOrAccessor<CrossOrigin>
  loop?: ValueOrAccessor<boolean | EmptyValue>
  mediaGroup?: ValueOrAccessor<string | EmptyValue>
  muted?: ValueOrAccessor<boolean | EmptyValue>
  playsInline?: ValueOrAccessor<boolean | EmptyValue>
  preload?: ValueOrAccessor<string | EmptyValue>
  src?: ValueOrAccessor<string | EmptyValue>
}

export interface MetaHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  charSet?: ValueOrAccessor<string | EmptyValue>
  content?: ValueOrAccessor<string | EmptyValue>
  httpEquiv?: ValueOrAccessor<string | EmptyValue>
  media?: ValueOrAccessor<string | EmptyValue>
  name?: ValueOrAccessor<string | EmptyValue>
}

export interface MeterHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  form?: ValueOrAccessor<string | EmptyValue>
  high?: ValueOrAccessor<number | EmptyValue>
  low?: ValueOrAccessor<number | EmptyValue>
  max?: ValueOrAccessor<number | string | EmptyValue>
  min?: ValueOrAccessor<number | string | EmptyValue>
  optimum?: ValueOrAccessor<number | EmptyValue>
  value?: ValueOrAccessor<string | readonly string[] | number | EmptyValue>
}

export interface QuoteHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  cite?: ValueOrAccessor<string | EmptyValue>
}

export interface ObjectHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  classID?: ValueOrAccessor<string | EmptyValue>
  data?: ValueOrAccessor<string | EmptyValue>
  form?: ValueOrAccessor<string | EmptyValue>
  height?: ValueOrAccessor<number | string | EmptyValue>
  name?: ValueOrAccessor<string | EmptyValue>
  type?: ValueOrAccessor<string | EmptyValue>
  useMap?: ValueOrAccessor<string | EmptyValue>
  width?: ValueOrAccessor<number | string | EmptyValue>
  wmode?: ValueOrAccessor<string | EmptyValue>
}

export interface OlHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  reversed?: ValueOrAccessor<boolean | EmptyValue>
  start?: ValueOrAccessor<number | EmptyValue>
  type?: ValueOrAccessor<'1' | 'a' | 'A' | 'i' | 'I' | EmptyValue>
}

export interface OptgroupHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  disabled?: ValueOrAccessor<boolean | EmptyValue>
  label?: ValueOrAccessor<string | EmptyValue>
}

export interface OptionHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  disabled?: ValueOrAccessor<boolean | EmptyValue>
  label?: ValueOrAccessor<string | EmptyValue>
  selected?: ValueOrAccessor<boolean | EmptyValue>
  value?: ValueOrAccessor<string | readonly string[] | number | EmptyValue>
}

export interface OutputHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  form?: ValueOrAccessor<string | EmptyValue>
  for?: ValueOrAccessor<string | EmptyValue>
  name?: ValueOrAccessor<string | EmptyValue>
}

export interface ParamHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  name?: ValueOrAccessor<string | EmptyValue>
  value?: ValueOrAccessor<string | readonly string[] | number | EmptyValue>
}

export interface ProgressHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  max?: ValueOrAccessor<number | string | EmptyValue>
  value?: ValueOrAccessor<string | readonly string[] | number | EmptyValue>
}

export interface SlotHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  name?: ValueOrAccessor<string | EmptyValue>
}

export interface ScriptHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  async?: ValueOrAccessor<boolean | EmptyValue>
  /** @deprecated */
  charSet?: ValueOrAccessor<string | EmptyValue>
  crossOrigin?: ValueOrAccessor<CrossOrigin>
  defer?: ValueOrAccessor<boolean | EmptyValue>
  integrity?: ValueOrAccessor<string | EmptyValue>
  noModule?: ValueOrAccessor<boolean | EmptyValue>
  referrerPolicy?: ValueOrAccessor<HTMLAttributeReferrerPolicy | EmptyValue>
  src?: ValueOrAccessor<string | EmptyValue>
  type?: ValueOrAccessor<string | EmptyValue>
}

export interface SelectHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  autoComplete?: ValueOrAccessor<string | EmptyValue>
  disabled?: ValueOrAccessor<boolean | EmptyValue>
  form?: ValueOrAccessor<string | EmptyValue>
  multiple?: ValueOrAccessor<boolean | EmptyValue>
  name?: ValueOrAccessor<string | EmptyValue>
  required?: ValueOrAccessor<boolean | EmptyValue>
  size?: ValueOrAccessor<number | EmptyValue>
  value?: ValueOrAccessor<string | readonly string[] | number | EmptyValue>
  onChange?: ChangeEventHandler<T> | undefined
}

export interface SourceHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  height?: ValueOrAccessor<number | string | EmptyValue>
  media?: ValueOrAccessor<string | EmptyValue>
  sizes?: ValueOrAccessor<string | EmptyValue>
  src?: ValueOrAccessor<string | EmptyValue>
  srcSet?: ValueOrAccessor<string | EmptyValue>
  type?: ValueOrAccessor<string | EmptyValue>
  width?: ValueOrAccessor<number | string | EmptyValue>
}

export interface StyleHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  media?: ValueOrAccessor<string | EmptyValue>
  scoped?: ValueOrAccessor<boolean | EmptyValue>
  type?: ValueOrAccessor<string | EmptyValue>
}

export interface TableHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  align?: ValueOrAccessor<'left' | 'center' | 'right' | EmptyValue>
  bgcolor?: ValueOrAccessor<string | EmptyValue>
  border?: ValueOrAccessor<number | EmptyValue>
  cellPadding?: ValueOrAccessor<number | string | EmptyValue>
  cellSpacing?: ValueOrAccessor<number | string | EmptyValue>
  frame?: ValueOrAccessor<boolean | EmptyValue>
  rules?: ValueOrAccessor<'none' | 'groups' | 'rows' | 'columns' | 'all' | EmptyValue>
  summary?: ValueOrAccessor<string | EmptyValue>
  width?: ValueOrAccessor<number | string | EmptyValue>
}

export interface TextareaHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  autoComplete?: ValueOrAccessor<string | EmptyValue>
  cols?: ValueOrAccessor<number | EmptyValue>
  dirName?: ValueOrAccessor<string | EmptyValue>
  disabled?: ValueOrAccessor<boolean | EmptyValue>
  form?: ValueOrAccessor<string | EmptyValue>
  maxLength?: ValueOrAccessor<number | EmptyValue>
  minLength?: ValueOrAccessor<number | EmptyValue>
  name?: ValueOrAccessor<string | EmptyValue>
  placeholder?: ValueOrAccessor<string | EmptyValue>
  readOnly?: ValueOrAccessor<boolean | EmptyValue>
  required?: ValueOrAccessor<boolean | EmptyValue>
  rows?: ValueOrAccessor<number | EmptyValue>
  value?: ValueOrAccessor<string | readonly string[] | number | EmptyValue>
  wrap?: ValueOrAccessor<string | EmptyValue>

  onChange?: ChangeEventHandler<T> | undefined
}

export interface TdHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  align?: ValueOrAccessor<'left' | 'center' | 'right' | 'justify' | 'char' | EmptyValue>
  colSpan?: ValueOrAccessor<number | EmptyValue>
  headers?: ValueOrAccessor<string | EmptyValue>
  rowSpan?: ValueOrAccessor<number | EmptyValue>
  scope?: ValueOrAccessor<string | EmptyValue>
  abbr?: ValueOrAccessor<string | EmptyValue>
  height?: ValueOrAccessor<number | string | EmptyValue>
  width?: ValueOrAccessor<number | string | EmptyValue>
  valign?: ValueOrAccessor<'top' | 'middle' | 'bottom' | 'baseline' | EmptyValue>
}

export interface ThHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  align?: ValueOrAccessor<'left' | 'center' | 'right' | 'justify' | 'char' | EmptyValue>
  colSpan?: ValueOrAccessor<number | EmptyValue>
  headers?: ValueOrAccessor<string | EmptyValue>
  rowSpan?: ValueOrAccessor<number | EmptyValue>
  scope?: ValueOrAccessor<string | EmptyValue>
  abbr?: ValueOrAccessor<string | EmptyValue>
}

export interface TimeHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  dateTime?: ValueOrAccessor<string | EmptyValue>
}

export interface TrackHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  default?: ValueOrAccessor<boolean | EmptyValue>
  kind?: ValueOrAccessor<string | EmptyValue>
  label?: ValueOrAccessor<string | EmptyValue>
  src?: ValueOrAccessor<string | EmptyValue>
  srcLang?: ValueOrAccessor<string | EmptyValue>
}

export interface VideoHTMLAttributes<T extends HTMLElement> extends MediaHTMLAttributes<T> {
  height?: ValueOrAccessor<number | string | EmptyValue>
  playsInline?: ValueOrAccessor<boolean | EmptyValue>
  poster?: ValueOrAccessor<string | EmptyValue>
  width?: ValueOrAccessor<number | string | EmptyValue>
  disablePictureInPicture?: ValueOrAccessor<boolean | EmptyValue>
  disableRemotePlayback?: ValueOrAccessor<boolean | EmptyValue>
}

// The three broad type categories are (in order of restrictiveness):
//   - "number | string"
//   - "string"
//   - union of string literals
export interface SVGAttributes<T extends Element> extends AriaAttributes, DOMAttributes<T> {
  // Attributes which also defined in HTMLAttributes
  // See comment in SVGDOMPropertyConfig.js
  class?: ValueOrAccessor<string | EmptyValue>
  color?: ValueOrAccessor<string | EmptyValue>
  height?: ValueOrAccessor<number | string | EmptyValue>
  id?: ValueOrAccessor<string | EmptyValue>
  lang?: ValueOrAccessor<string | EmptyValue>
  max?: ValueOrAccessor<number | string | EmptyValue>
  media?: ValueOrAccessor<string | EmptyValue>
  method?: ValueOrAccessor<string | EmptyValue>
  min?: ValueOrAccessor<number | string | EmptyValue>
  name?: ValueOrAccessor<string | EmptyValue>
  style?: ValueOrAccessor<string | EmptyValue>
  target?: ValueOrAccessor<string | EmptyValue>
  type?: ValueOrAccessor<string | EmptyValue>
  width?: ValueOrAccessor<number | string | EmptyValue>

  // Other HTML properties supported by SVG elements in browsers
  role?: ValueOrAccessor<AriaRole | EmptyValue>
  tabIndex?: ValueOrAccessor<number | EmptyValue>
  crossOrigin?: ValueOrAccessor<CrossOrigin>

  // SVG Specific attributes
  accentHeight?: ValueOrAccessor<number | string | EmptyValue>
  accumulate?: ValueOrAccessor<'none' | 'sum' | EmptyValue>
  additive?: ValueOrAccessor<'replace' | 'sum' | EmptyValue>
  alignmentBaseline?: ValueOrAccessor<
    | 'auto'
    | 'baseline'
    | 'before-edge'
    | 'text-before-edge'
    | 'middle'
    | 'central'
    | 'after-edge'
    | 'text-after-edge'
    | 'ideographic'
    | 'alphabetic'
    | 'hanging'
    | 'mathematical'
    | 'inherit'
    | EmptyValue
  >
  allowReorder?: ValueOrAccessor<'no' | 'yes' | EmptyValue>
  alphabetic?: ValueOrAccessor<number | string | EmptyValue>
  amplitude?: ValueOrAccessor<number | string | EmptyValue>
  arabicForm?: ValueOrAccessor<'initial' | 'medial' | 'terminal' | 'isolated' | EmptyValue>
  ascent?: ValueOrAccessor<number | string | EmptyValue>
  attributeName?: ValueOrAccessor<string | EmptyValue>
  attributeType?: ValueOrAccessor<string | EmptyValue>
  autoReverse?: ValueOrAccessor<Booleanish | EmptyValue>
  azimuth?: ValueOrAccessor<number | string | EmptyValue>
  baseFrequency?: ValueOrAccessor<number | string | EmptyValue>
  baselineShift?: ValueOrAccessor<number | string | EmptyValue>
  baseProfile?: ValueOrAccessor<number | string | EmptyValue>
  bbox?: ValueOrAccessor<number | string | EmptyValue>
  begin?: ValueOrAccessor<number | string | EmptyValue>
  bias?: ValueOrAccessor<number | string | EmptyValue>
  by?: ValueOrAccessor<number | string | EmptyValue>
  calcMode?: ValueOrAccessor<number | string | EmptyValue>
  capHeight?: ValueOrAccessor<number | string | EmptyValue>
  clip?: ValueOrAccessor<number | string | EmptyValue>
  clipPath?: ValueOrAccessor<string | EmptyValue>
  clipPathUnits?: ValueOrAccessor<number | string | EmptyValue>
  clipRule?: ValueOrAccessor<number | string | EmptyValue>
  colorInterpolation?: ValueOrAccessor<number | string | EmptyValue>
  colorInterpolationFilters?: ValueOrAccessor<'auto' | 'sRGB' | 'linearRGB' | 'inherit' | EmptyValue>
  colorProfile?: ValueOrAccessor<number | string | EmptyValue>
  colorRendering?: ValueOrAccessor<number | string | EmptyValue>
  contentScriptType?: ValueOrAccessor<number | string | EmptyValue>
  contentStyleType?: ValueOrAccessor<number | string | EmptyValue>
  cursor?: ValueOrAccessor<number | string | EmptyValue>
  cx?: ValueOrAccessor<number | string | EmptyValue>
  cy?: ValueOrAccessor<number | string | EmptyValue>
  d?: ValueOrAccessor<string | EmptyValue>
  decelerate?: ValueOrAccessor<number | string | EmptyValue>
  descent?: ValueOrAccessor<number | string | EmptyValue>
  diffuseConstant?: ValueOrAccessor<number | string | EmptyValue>
  direction?: ValueOrAccessor<number | string | EmptyValue>
  display?: ValueOrAccessor<number | string | EmptyValue>
  divisor?: ValueOrAccessor<number | string | EmptyValue>
  dominantBaseline?: ValueOrAccessor<number | string | EmptyValue>
  dur?: ValueOrAccessor<number | string | EmptyValue>
  dx?: ValueOrAccessor<number | string | EmptyValue>
  dy?: ValueOrAccessor<number | string | EmptyValue>
  edgeMode?: ValueOrAccessor<number | string | EmptyValue>
  elevation?: ValueOrAccessor<number | string | EmptyValue>
  enableBackground?: ValueOrAccessor<number | string | EmptyValue>
  end?: ValueOrAccessor<number | string | EmptyValue>
  exponent?: ValueOrAccessor<number | string | EmptyValue>
  externalResourcesRequired?: ValueOrAccessor<Booleanish | EmptyValue>
  fill?: ValueOrAccessor<string | EmptyValue>
  fillOpacity?: ValueOrAccessor<number | string | EmptyValue>
  fillRule?: ValueOrAccessor<'nonzero' | 'evenodd' | 'inherit' | EmptyValue>
  filter?: ValueOrAccessor<string | EmptyValue>
  filterRes?: ValueOrAccessor<number | string | EmptyValue>
  filterUnits?: ValueOrAccessor<number | string | EmptyValue>
  floodColor?: ValueOrAccessor<number | string | EmptyValue>
  floodOpacity?: ValueOrAccessor<number | string | EmptyValue>
  focusable?: ValueOrAccessor<Booleanish | 'auto' | EmptyValue>
  fontFamily?: ValueOrAccessor<string | EmptyValue>
  fontSize?: ValueOrAccessor<number | string | EmptyValue>
  fontSizeAdjust?: ValueOrAccessor<number | string | EmptyValue>
  fontStretch?: ValueOrAccessor<number | string | EmptyValue>
  fontStyle?: ValueOrAccessor<number | string | EmptyValue>
  fontVariant?: ValueOrAccessor<number | string | EmptyValue>
  fontWeight?: ValueOrAccessor<number | string | EmptyValue>
  format?: ValueOrAccessor<number | string | EmptyValue>
  fr?: ValueOrAccessor<number | string | EmptyValue>
  from?: ValueOrAccessor<number | string | EmptyValue>
  fx?: ValueOrAccessor<number | string | EmptyValue>
  fy?: ValueOrAccessor<number | string | EmptyValue>
  g1?: ValueOrAccessor<number | string | EmptyValue>
  g2?: ValueOrAccessor<number | string | EmptyValue>
  glyphName?: ValueOrAccessor<number | string | EmptyValue>
  glyphOrientationHorizontal?: ValueOrAccessor<number | string | EmptyValue>
  glyphOrientationVertical?: ValueOrAccessor<number | string | EmptyValue>
  glyphRef?: ValueOrAccessor<number | string | EmptyValue>
  gradientTransform?: ValueOrAccessor<string | EmptyValue>
  gradientUnits?: ValueOrAccessor<string | EmptyValue>
  hanging?: ValueOrAccessor<number | string | EmptyValue>
  horizAdvX?: ValueOrAccessor<number | string | EmptyValue>
  horizOriginX?: ValueOrAccessor<number | string | EmptyValue>
  href?: ValueOrAccessor<string | EmptyValue>
  ideographic?: ValueOrAccessor<number | string | EmptyValue>
  imageRendering?: ValueOrAccessor<number | string | EmptyValue>
  in2?: ValueOrAccessor<number | string | EmptyValue>
  in?: ValueOrAccessor<string | EmptyValue>
  intercept?: ValueOrAccessor<number | string | EmptyValue>
  k1?: ValueOrAccessor<number | string | EmptyValue>
  k2?: ValueOrAccessor<number | string | EmptyValue>
  k3?: ValueOrAccessor<number | string | EmptyValue>
  k4?: ValueOrAccessor<number | string | EmptyValue>
  k?: ValueOrAccessor<number | string | EmptyValue>
  kernelMatrix?: ValueOrAccessor<number | string | EmptyValue>
  kernelUnitLength?: ValueOrAccessor<number | string | EmptyValue>
  kerning?: ValueOrAccessor<number | string | EmptyValue>
  keyPoints?: ValueOrAccessor<number | string | EmptyValue>
  keySplines?: ValueOrAccessor<number | string | EmptyValue>
  keyTimes?: ValueOrAccessor<number | string | EmptyValue>
  lengthAdjust?: ValueOrAccessor<number | string | EmptyValue>
  letterSpacing?: ValueOrAccessor<number | string | EmptyValue>
  lightingColor?: ValueOrAccessor<number | string | EmptyValue>
  limitingConeAngle?: ValueOrAccessor<number | string | EmptyValue>
  local?: ValueOrAccessor<number | string | EmptyValue>
  markerEnd?: ValueOrAccessor<string | EmptyValue>
  markerHeight?: ValueOrAccessor<number | string | EmptyValue>
  markerMid?: ValueOrAccessor<string | EmptyValue>
  markerStart?: ValueOrAccessor<string | EmptyValue>
  markerUnits?: ValueOrAccessor<number | string | EmptyValue>
  markerWidth?: ValueOrAccessor<number | string | EmptyValue>
  mask?: ValueOrAccessor<string | EmptyValue>
  maskContentUnits?: ValueOrAccessor<number | string | EmptyValue>
  maskUnits?: ValueOrAccessor<number | string | EmptyValue>
  mathematical?: ValueOrAccessor<number | string | EmptyValue>
  mode?: ValueOrAccessor<number | string | EmptyValue>
  numOctaves?: ValueOrAccessor<number | string | EmptyValue>
  offset?: ValueOrAccessor<number | string | EmptyValue>
  opacity?: ValueOrAccessor<number | string | EmptyValue>
  operator?: ValueOrAccessor<number | string | EmptyValue>
  order?: ValueOrAccessor<number | string | EmptyValue>
  orient?: ValueOrAccessor<number | string | EmptyValue>
  orientation?: ValueOrAccessor<number | string | EmptyValue>
  origin?: ValueOrAccessor<number | string | EmptyValue>
  overflow?: ValueOrAccessor<number | string | EmptyValue>
  overlinePosition?: ValueOrAccessor<number | string | EmptyValue>
  overlineThickness?: ValueOrAccessor<number | string | EmptyValue>
  paintOrder?: ValueOrAccessor<number | string | EmptyValue>
  panose1?: ValueOrAccessor<number | string | EmptyValue>
  path?: ValueOrAccessor<string | EmptyValue>
  pathLength?: ValueOrAccessor<number | string | EmptyValue>
  patternContentUnits?: ValueOrAccessor<string | EmptyValue>
  patternTransform?: ValueOrAccessor<number | string | EmptyValue>
  patternUnits?: ValueOrAccessor<string | EmptyValue>
  pointerEvents?: ValueOrAccessor<number | string | EmptyValue>
  points?: ValueOrAccessor<string | EmptyValue>
  pointsAtX?: ValueOrAccessor<number | string | EmptyValue>
  pointsAtY?: ValueOrAccessor<number | string | EmptyValue>
  pointsAtZ?: ValueOrAccessor<number | string | EmptyValue>
  preserveAlpha?: ValueOrAccessor<Booleanish | EmptyValue>
  preserveAspectRatio?: ValueOrAccessor<string | EmptyValue>
  primitiveUnits?: ValueOrAccessor<number | string | EmptyValue>
  r?: ValueOrAccessor<number | string | EmptyValue>
  radius?: ValueOrAccessor<number | string | EmptyValue>
  refX?: ValueOrAccessor<number | string | EmptyValue>
  refY?: ValueOrAccessor<number | string | EmptyValue>
  renderingIntent?: ValueOrAccessor<number | string | EmptyValue>
  repeatCount?: ValueOrAccessor<number | string | EmptyValue>
  repeatDur?: ValueOrAccessor<number | string | EmptyValue>
  requiredExtensions?: ValueOrAccessor<number | string | EmptyValue>
  requiredFeatures?: ValueOrAccessor<number | string | EmptyValue>
  restart?: ValueOrAccessor<number | string | EmptyValue>
  result?: ValueOrAccessor<string | EmptyValue>
  rotate?: ValueOrAccessor<number | string | EmptyValue>
  rx?: ValueOrAccessor<number | string | EmptyValue>
  ry?: ValueOrAccessor<number | string | EmptyValue>
  scale?: ValueOrAccessor<number | string | EmptyValue>
  seed?: ValueOrAccessor<number | string | EmptyValue>
  shapeRendering?: ValueOrAccessor<number | string | EmptyValue>
  slope?: ValueOrAccessor<number | string | EmptyValue>
  spacing?: ValueOrAccessor<number | string | EmptyValue>
  specularConstant?: ValueOrAccessor<number | string | EmptyValue>
  specularExponent?: ValueOrAccessor<number | string | EmptyValue>
  speed?: ValueOrAccessor<number | string | EmptyValue>
  spreadMethod?: ValueOrAccessor<string | EmptyValue>
  startOffset?: ValueOrAccessor<number | string | EmptyValue>
  stdDeviation?: ValueOrAccessor<number | string | EmptyValue>
  stemh?: ValueOrAccessor<number | string | EmptyValue>
  stemv?: ValueOrAccessor<number | string | EmptyValue>
  stitchTiles?: ValueOrAccessor<number | string | EmptyValue>
  stopColor?: ValueOrAccessor<string | EmptyValue>
  stopOpacity?: ValueOrAccessor<number | string | EmptyValue>
  strikethroughPosition?: ValueOrAccessor<number | string | EmptyValue>
  strikethroughThickness?: ValueOrAccessor<number | string | EmptyValue>
  string?: ValueOrAccessor<number | string | EmptyValue>
  stroke?: ValueOrAccessor<string | EmptyValue>
  strokeDasharray?: ValueOrAccessor<string | number | EmptyValue>
  strokeDashoffset?: ValueOrAccessor<string | number | EmptyValue>
  strokeLinecap?: ValueOrAccessor<'butt' | 'round' | 'square' | 'inherit' | EmptyValue>
  strokeLinejoin?: ValueOrAccessor<'miter' | 'round' | 'bevel' | 'inherit' | EmptyValue>
  strokeMiterlimit?: ValueOrAccessor<number | string | EmptyValue>
  strokeOpacity?: ValueOrAccessor<number | string | EmptyValue>
  strokeWidth?: ValueOrAccessor<number | string | EmptyValue>
  surfaceScale?: ValueOrAccessor<number | string | EmptyValue>
  systemLanguage?: ValueOrAccessor<number | string | EmptyValue>
  tableValues?: ValueOrAccessor<number | string | EmptyValue>
  targetX?: ValueOrAccessor<number | string | EmptyValue>
  targetY?: ValueOrAccessor<number | string | EmptyValue>
  textAnchor?: ValueOrAccessor<string | EmptyValue>
  textDecoration?: ValueOrAccessor<number | string | EmptyValue>
  textLength?: ValueOrAccessor<number | string | EmptyValue>
  textRendering?: ValueOrAccessor<number | string | EmptyValue>
  to?: ValueOrAccessor<number | string | EmptyValue>
  transform?: ValueOrAccessor<string | EmptyValue>
  u1?: ValueOrAccessor<number | string | EmptyValue>
  u2?: ValueOrAccessor<number | string | EmptyValue>
  underlinePosition?: ValueOrAccessor<number | string | EmptyValue>
  underlineThickness?: ValueOrAccessor<number | string | EmptyValue>
  unicode?: ValueOrAccessor<number | string | EmptyValue>
  unicodeBidi?: ValueOrAccessor<number | string | EmptyValue>
  unicodeRange?: ValueOrAccessor<number | string | EmptyValue>
  unitsPerEm?: ValueOrAccessor<number | string | EmptyValue>
  vAlphabetic?: ValueOrAccessor<number | string | EmptyValue>
  values?: ValueOrAccessor<string | EmptyValue>
  vectorEffect?: ValueOrAccessor<number | string | EmptyValue>
  version?: ValueOrAccessor<string | EmptyValue>
  vertAdvY?: ValueOrAccessor<number | string | EmptyValue>
  vertOriginX?: ValueOrAccessor<number | string | EmptyValue>
  vertOriginY?: ValueOrAccessor<number | string | EmptyValue>
  vHanging?: ValueOrAccessor<number | string | EmptyValue>
  vIdeographic?: ValueOrAccessor<number | string | EmptyValue>
  viewBox?: ValueOrAccessor<string | EmptyValue>
  viewTarget?: ValueOrAccessor<number | string | EmptyValue>
  visibility?: ValueOrAccessor<number | string | EmptyValue>
  vMathematical?: ValueOrAccessor<number | string | EmptyValue>
  widths?: ValueOrAccessor<number | string | EmptyValue>
  wordSpacing?: ValueOrAccessor<number | string | EmptyValue>
  writingMode?: ValueOrAccessor<number | string | EmptyValue>
  x1?: ValueOrAccessor<number | string | EmptyValue>
  x2?: ValueOrAccessor<number | string | EmptyValue>
  x?: ValueOrAccessor<number | string | EmptyValue>
  xChannelSelector?: ValueOrAccessor<string | EmptyValue>
  xHeight?: ValueOrAccessor<number | string | EmptyValue>
  xlinkActuate?: ValueOrAccessor<string | EmptyValue>
  xlinkArcrole?: ValueOrAccessor<string | EmptyValue>
  xlinkHref?: ValueOrAccessor<string | EmptyValue>
  xlinkRole?: ValueOrAccessor<string | EmptyValue>
  xlinkShow?: ValueOrAccessor<string | EmptyValue>
  xlinkTitle?: ValueOrAccessor<string | EmptyValue>
  xlinkType?: ValueOrAccessor<string | EmptyValue>
  xmlBase?: ValueOrAccessor<string | EmptyValue>
  xmlLang?: ValueOrAccessor<string | EmptyValue>
  xmlns?: ValueOrAccessor<string | EmptyValue>
  xmlnsXlink?: ValueOrAccessor<string | EmptyValue>
  xmlSpace?: ValueOrAccessor<string | EmptyValue>
  y1?: ValueOrAccessor<number | string | EmptyValue>
  y2?: ValueOrAccessor<number | string | EmptyValue>
  y?: ValueOrAccessor<number | string | EmptyValue>
  yChannelSelector?: ValueOrAccessor<string | EmptyValue>
  z?: ValueOrAccessor<number | string | EmptyValue>
  zoomAndPan?: ValueOrAccessor<string | EmptyValue>
}
