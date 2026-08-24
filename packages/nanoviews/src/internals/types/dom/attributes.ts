import type * as CSS from 'csstype'
import type { Signalish } from 'kida'
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
  defaultChecked?: Signalish<boolean | EmptyValue>
  defaultValue?: Signalish<string | number | readonly string[] | EmptyValue>
  suppressContentEditableWarning?: Signalish<boolean | EmptyValue>
  suppressHydrationWarning?: Signalish<boolean | EmptyValue>

  // Standard HTML Attributes
  accessKey?: Signalish<string | EmptyValue>
  autoFocus?: Signalish<boolean | EmptyValue>
  class?: Signalish<string | EmptyValue>
  contentEditable?: Signalish<Booleanish | 'inherit' | 'plaintext-only' | EmptyValue>
  contextMenu?: Signalish<string | EmptyValue>
  dir?: Signalish<string | EmptyValue>
  draggable?: Signalish<Booleanish | EmptyValue>
  hidden?: Signalish<boolean | EmptyValue>
  id?: Signalish<string | EmptyValue>
  lang?: Signalish<string | EmptyValue>
  nonce?: Signalish<string | EmptyValue>
  slot?: Signalish<string | EmptyValue>
  spellCheck?: Signalish<Booleanish | EmptyValue>
  style?: Signalish<string | EmptyValue>
  tabIndex?: Signalish<number | EmptyValue>
  title?: Signalish<string | EmptyValue>
  translate?: Signalish<'yes' | 'no' | EmptyValue>

  // Unknown
  radioGroup?: Signalish<string | EmptyValue> // <command>, <menuitem>

  // WAI-ARIA
  role?: Signalish<AriaRole | EmptyValue>

  // RDFa Attributes
  about?: Signalish<string | EmptyValue>
  content?: Signalish<string | EmptyValue>
  datatype?: Signalish<string | EmptyValue>
  inlist?: Signalish<any>
  prefix?: Signalish<string | EmptyValue>
  property?: Signalish<string | EmptyValue>
  rel?: Signalish<string | EmptyValue>
  resource?: Signalish<string | EmptyValue>
  rev?: Signalish<string | EmptyValue>
  typeof?: Signalish<string | EmptyValue>
  vocab?: Signalish<string | EmptyValue>

  // Non-standard Attributes
  autoCapitalize?: Signalish<string | EmptyValue>
  autoCorrect?: Signalish<string | EmptyValue>
  autoSave?: Signalish<string | EmptyValue>
  color?: Signalish<string | EmptyValue>
  itemProp?: Signalish<string | EmptyValue>
  itemScope?: Signalish<boolean | EmptyValue>
  itemType?: Signalish<string | EmptyValue>
  itemID?: Signalish<string | EmptyValue>
  itemRef?: Signalish<string | EmptyValue>
  results?: Signalish<number | EmptyValue>
  security?: Signalish<string | EmptyValue>
  unselectable?: Signalish<'on' | 'off' | EmptyValue>

  // Living Standard
  /**
   * Hints at the type of data that might be entered by the user while editing the element or its contents
   * @see {@link https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute}
   */
  inputMode?: Signalish<'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | EmptyValue>
  /**
   * Specify that a standard HTML element should behave like a defined custom built-in element
   * @see {@link https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is}
   */
  is?: Signalish<string | EmptyValue>

  /**
   * Data attributes
   */
  [key: `data-${string}`]: Signalish<unknown>
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
  download?: Signalish<any>
  href?: Signalish<string | EmptyValue>
  hrefLang?: Signalish<string | EmptyValue>
  media?: Signalish<string | EmptyValue>
  ping?: Signalish<string | EmptyValue>
  target?: Signalish<HTMLAttributeAnchorTarget | EmptyValue>
  type?: Signalish<string | EmptyValue>
  referrerPolicy?: Signalish<HTMLAttributeReferrerPolicy | EmptyValue>
}

export interface AudioHTMLAttributes<T extends HTMLElement> extends MediaHTMLAttributes<T> {}

export interface AreaHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  alt?: Signalish<string | EmptyValue>
  coords?: Signalish<string | EmptyValue>
  download?: Signalish<any>
  href?: Signalish<string | EmptyValue>
  hrefLang?: Signalish<string | EmptyValue>
  media?: Signalish<string | EmptyValue>
  referrerPolicy?: Signalish<HTMLAttributeReferrerPolicy | EmptyValue>
  shape?: Signalish<string | EmptyValue>
  target?: Signalish<string | EmptyValue>
}

export interface BaseHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  href?: Signalish<string | EmptyValue>
  target?: Signalish<string | EmptyValue>
}

export interface BlockquoteHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  cite?: Signalish<string | EmptyValue>
}

export interface ButtonHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  disabled?: Signalish<boolean | EmptyValue>
  form?: Signalish<string | EmptyValue>
  formAction?: Signalish<string | EmptyValue>
  formEncType?: Signalish<string | EmptyValue>
  formMethod?: Signalish<string | EmptyValue>
  formNoValidate?: Signalish<boolean | EmptyValue>
  formTarget?: Signalish<string | EmptyValue>
  name?: Signalish<string | EmptyValue>
  type?: Signalish<'submit' | 'reset' | 'button' | EmptyValue>
  value?: Signalish<string | readonly string[] | number | EmptyValue>
}

export interface CanvasHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  height?: Signalish<number | string | EmptyValue>
  width?: Signalish<number | string | EmptyValue>
}

export interface ColHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  span?: Signalish<number | EmptyValue>
  width?: Signalish<number | string | EmptyValue>
}

export interface ColgroupHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  span?: Signalish<number | EmptyValue>
}

export interface DataHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  value?: Signalish<string | readonly string[] | number | EmptyValue>
}

export interface DetailsHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  open?: Signalish<boolean | EmptyValue>
  onToggle?: TargetEventHandler<T> | EmptyValue
  name?: Signalish<string | EmptyValue>
}

export interface DelHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  cite?: Signalish<string | EmptyValue>
  dateTime?: Signalish<string | EmptyValue>
}

export interface DialogHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  onCancel?: TargetEventHandler<T> | EmptyValue
  onClose?: TargetEventHandler<T> | EmptyValue
  open?: Signalish<boolean | EmptyValue>
}

export interface EmbedHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  height?: Signalish<number | string | EmptyValue>
  src?: Signalish<string | EmptyValue>
  type?: Signalish<string | EmptyValue>
  width?: Signalish<number | string | EmptyValue>
}

export interface FieldsetHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  disabled?: Signalish<boolean | EmptyValue>
  form?: Signalish<string | EmptyValue>
  name?: Signalish<string | EmptyValue>
}

export interface FormHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  acceptCharset?: Signalish<string | EmptyValue>
  action?: Signalish<string | EmptyValue>
  autoComplete?: Signalish<string | EmptyValue>
  encType?: Signalish<string | EmptyValue>
  method?: Signalish<string | EmptyValue>
  name?: Signalish<string | EmptyValue>
  noValidate?: Signalish<boolean | EmptyValue>
  target?: Signalish<string | EmptyValue>
}

export interface HtmlHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  manifest?: Signalish<string | EmptyValue>
}

export interface IframeHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  allow?: Signalish<string | EmptyValue>
  allowFullScreen?: Signalish<boolean | EmptyValue>
  allowTransparency?: Signalish<boolean | EmptyValue>
  /** @deprecated */
  frameBorder?: Signalish<number | string | EmptyValue>
  height?: Signalish<number | string | EmptyValue>
  loading?: Signalish<'eager' | 'lazy' | EmptyValue>
  /** @deprecated */
  marginHeight?: Signalish<number | EmptyValue>
  /** @deprecated */
  marginWidth?: Signalish<number | EmptyValue>
  name?: Signalish<string | EmptyValue>
  referrerPolicy?: Signalish<HTMLAttributeReferrerPolicy | EmptyValue>
  sandbox?: Signalish<string | EmptyValue>
  /** @deprecated */
  scrolling?: Signalish<string | EmptyValue>
  seamless?: Signalish<boolean | EmptyValue>
  src?: Signalish<string | EmptyValue>
  srcDoc?: Signalish<string | EmptyValue>
  width?: Signalish<number | string | EmptyValue>
}

export interface ImgHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  alt?: Signalish<string | EmptyValue>
  crossOrigin?: Signalish<CrossOrigin>
  decoding?: Signalish<'async' | 'auto' | 'sync' | EmptyValue>
  fetchPriority?: Signalish<'high' | 'low' | 'auto'>
  height?: Signalish<number | string | EmptyValue>
  loading?: Signalish<'eager' | 'lazy' | EmptyValue>
  referrerPolicy?: Signalish<HTMLAttributeReferrerPolicy | EmptyValue>
  sizes?: Signalish<string | EmptyValue>
  src?: Signalish<string | EmptyValue>
  srcSet?: Signalish<string | EmptyValue>
  useMap?: Signalish<string | EmptyValue>
  width?: Signalish<number | string | EmptyValue>
}

export interface InsHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  cite?: Signalish<string | EmptyValue>
  dateTime?: Signalish<string | EmptyValue>
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
  accept?: Signalish<string | EmptyValue>
  alt?: Signalish<string | EmptyValue>
  autoComplete?: Signalish<HTMLInputAutoCompleteAttribute | EmptyValue>
  capture?: Signalish<boolean | 'user' | 'environment' | EmptyValue> // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
  checked?: Signalish<boolean | EmptyValue>
  disabled?: Signalish<boolean | EmptyValue>
  enterKeyHint?: Signalish<'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | EmptyValue>
  form?: Signalish<string | EmptyValue>
  formAction?: Signalish<string | EmptyValue>
  formEncType?: Signalish<string | EmptyValue>
  formMethod?: Signalish<string | EmptyValue>
  formNoValidate?: Signalish<boolean | EmptyValue>
  formTarget?: Signalish<string | EmptyValue>
  height?: Signalish<number | string | EmptyValue>
  list?: Signalish<string | EmptyValue>
  max?: Signalish<number | string | EmptyValue>
  maxLength?: Signalish<number | EmptyValue>
  min?: Signalish<number | string | EmptyValue>
  minLength?: Signalish<number | EmptyValue>
  multiple?: Signalish<boolean | EmptyValue>
  name?: Signalish<string | EmptyValue>
  pattern?: Signalish<string | EmptyValue>
  placeholder?: Signalish<string | EmptyValue>
  readOnly?: Signalish<boolean | EmptyValue>
  required?: Signalish<boolean | EmptyValue>
  size?: Signalish<number | EmptyValue>
  src?: Signalish<string | EmptyValue>
  step?: Signalish<number | string | EmptyValue>
  type?: Signalish<HTMLInputTypeAttribute | EmptyValue>
  value?: Signalish<string | readonly string[] | number | EmptyValue>
  width?: Signalish<number | string | EmptyValue>

  onChange?: ChangeEventHandler<T> | undefined
}

export interface KeygenHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  challenge?: Signalish<string | EmptyValue>
  disabled?: Signalish<boolean | EmptyValue>
  form?: Signalish<string | EmptyValue>
  keyType?: Signalish<string | EmptyValue>
  keyParams?: Signalish<string | EmptyValue>
  name?: Signalish<string | EmptyValue>
}

export interface LabelHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  form?: Signalish<string | EmptyValue>
  for?: Signalish<string | EmptyValue>
}

export interface LiHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  value?: Signalish<string | readonly string[] | number | EmptyValue>
}

export interface LinkHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  as?: Signalish<string | EmptyValue>
  crossOrigin?: Signalish<CrossOrigin>
  fetchPriority?: Signalish<'high' | 'low' | 'auto'>
  href?: Signalish<string | EmptyValue>
  hrefLang?: Signalish<string | EmptyValue>
  integrity?: Signalish<string | EmptyValue>
  media?: Signalish<string | EmptyValue>
  imageSrcSet?: Signalish<string | EmptyValue>
  imageSizes?: Signalish<string | EmptyValue>
  referrerPolicy?: Signalish<HTMLAttributeReferrerPolicy | EmptyValue>
  sizes?: Signalish<string | EmptyValue>
  type?: Signalish<string | EmptyValue>
  charSet?: Signalish<string | EmptyValue>
}

export interface MapHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  name?: Signalish<string | EmptyValue>
}

export interface MenuHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  type?: Signalish<string | EmptyValue>
}

export interface MediaHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  autoPlay?: Signalish<boolean | EmptyValue>
  controls?: Signalish<boolean | EmptyValue>
  controlsList?: Signalish<string | EmptyValue>
  crossOrigin?: Signalish<CrossOrigin>
  loop?: Signalish<boolean | EmptyValue>
  mediaGroup?: Signalish<string | EmptyValue>
  muted?: Signalish<boolean | EmptyValue>
  playsInline?: Signalish<boolean | EmptyValue>
  preload?: Signalish<string | EmptyValue>
  src?: Signalish<string | EmptyValue>
}

export interface MetaHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  charSet?: Signalish<string | EmptyValue>
  content?: Signalish<string | EmptyValue>
  httpEquiv?: Signalish<string | EmptyValue>
  media?: Signalish<string | EmptyValue>
  name?: Signalish<string | EmptyValue>
}

export interface MeterHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  form?: Signalish<string | EmptyValue>
  high?: Signalish<number | EmptyValue>
  low?: Signalish<number | EmptyValue>
  max?: Signalish<number | string | EmptyValue>
  min?: Signalish<number | string | EmptyValue>
  optimum?: Signalish<number | EmptyValue>
  value?: Signalish<string | readonly string[] | number | EmptyValue>
}

export interface QuoteHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  cite?: Signalish<string | EmptyValue>
}

export interface ObjectHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  classID?: Signalish<string | EmptyValue>
  data?: Signalish<string | EmptyValue>
  form?: Signalish<string | EmptyValue>
  height?: Signalish<number | string | EmptyValue>
  name?: Signalish<string | EmptyValue>
  type?: Signalish<string | EmptyValue>
  useMap?: Signalish<string | EmptyValue>
  width?: Signalish<number | string | EmptyValue>
  wmode?: Signalish<string | EmptyValue>
}

export interface OlHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  reversed?: Signalish<boolean | EmptyValue>
  start?: Signalish<number | EmptyValue>
  type?: Signalish<'1' | 'a' | 'A' | 'i' | 'I' | EmptyValue>
}

export interface OptgroupHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  disabled?: Signalish<boolean | EmptyValue>
  label?: Signalish<string | EmptyValue>
}

export interface OptionHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  disabled?: Signalish<boolean | EmptyValue>
  label?: Signalish<string | EmptyValue>
  selected?: Signalish<boolean | EmptyValue>
  value?: Signalish<string | readonly string[] | number | EmptyValue>
}

export interface OutputHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  form?: Signalish<string | EmptyValue>
  for?: Signalish<string | EmptyValue>
  name?: Signalish<string | EmptyValue>
}

export interface ParamHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  name?: Signalish<string | EmptyValue>
  value?: Signalish<string | readonly string[] | number | EmptyValue>
}

export interface ProgressHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  max?: Signalish<number | string | EmptyValue>
  value?: Signalish<string | readonly string[] | number | EmptyValue>
}

export interface SlotHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  name?: Signalish<string | EmptyValue>
}

export interface ScriptHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  async?: Signalish<boolean | EmptyValue>
  /** @deprecated */
  charSet?: Signalish<string | EmptyValue>
  crossOrigin?: Signalish<CrossOrigin>
  defer?: Signalish<boolean | EmptyValue>
  integrity?: Signalish<string | EmptyValue>
  noModule?: Signalish<boolean | EmptyValue>
  referrerPolicy?: Signalish<HTMLAttributeReferrerPolicy | EmptyValue>
  src?: Signalish<string | EmptyValue>
  type?: Signalish<string | EmptyValue>
}

export interface SelectHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  autoComplete?: Signalish<string | EmptyValue>
  disabled?: Signalish<boolean | EmptyValue>
  form?: Signalish<string | EmptyValue>
  multiple?: Signalish<boolean | EmptyValue>
  name?: Signalish<string | EmptyValue>
  required?: Signalish<boolean | EmptyValue>
  size?: Signalish<number | EmptyValue>
  value?: Signalish<string | readonly string[] | number | EmptyValue>
  onChange?: ChangeEventHandler<T> | undefined
}

export interface SourceHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  height?: Signalish<number | string | EmptyValue>
  media?: Signalish<string | EmptyValue>
  sizes?: Signalish<string | EmptyValue>
  src?: Signalish<string | EmptyValue>
  srcSet?: Signalish<string | EmptyValue>
  type?: Signalish<string | EmptyValue>
  width?: Signalish<number | string | EmptyValue>
}

export interface StyleHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  media?: Signalish<string | EmptyValue>
  scoped?: Signalish<boolean | EmptyValue>
  type?: Signalish<string | EmptyValue>
}

export interface TableHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  align?: Signalish<'left' | 'center' | 'right' | EmptyValue>
  bgcolor?: Signalish<string | EmptyValue>
  border?: Signalish<number | EmptyValue>
  cellPadding?: Signalish<number | string | EmptyValue>
  cellSpacing?: Signalish<number | string | EmptyValue>
  frame?: Signalish<boolean | EmptyValue>
  rules?: Signalish<'none' | 'groups' | 'rows' | 'columns' | 'all' | EmptyValue>
  summary?: Signalish<string | EmptyValue>
  width?: Signalish<number | string | EmptyValue>
}

export interface TextareaHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  autoComplete?: Signalish<string | EmptyValue>
  cols?: Signalish<number | EmptyValue>
  dirName?: Signalish<string | EmptyValue>
  disabled?: Signalish<boolean | EmptyValue>
  form?: Signalish<string | EmptyValue>
  maxLength?: Signalish<number | EmptyValue>
  minLength?: Signalish<number | EmptyValue>
  name?: Signalish<string | EmptyValue>
  placeholder?: Signalish<string | EmptyValue>
  readOnly?: Signalish<boolean | EmptyValue>
  required?: Signalish<boolean | EmptyValue>
  rows?: Signalish<number | EmptyValue>
  value?: Signalish<string | readonly string[] | number | EmptyValue>
  wrap?: Signalish<string | EmptyValue>

  onChange?: ChangeEventHandler<T> | undefined
}

export interface TdHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  align?: Signalish<'left' | 'center' | 'right' | 'justify' | 'char' | EmptyValue>
  colSpan?: Signalish<number | EmptyValue>
  headers?: Signalish<string | EmptyValue>
  rowSpan?: Signalish<number | EmptyValue>
  scope?: Signalish<string | EmptyValue>
  abbr?: Signalish<string | EmptyValue>
  height?: Signalish<number | string | EmptyValue>
  width?: Signalish<number | string | EmptyValue>
  valign?: Signalish<'top' | 'middle' | 'bottom' | 'baseline' | EmptyValue>
}

export interface ThHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  align?: Signalish<'left' | 'center' | 'right' | 'justify' | 'char' | EmptyValue>
  colSpan?: Signalish<number | EmptyValue>
  headers?: Signalish<string | EmptyValue>
  rowSpan?: Signalish<number | EmptyValue>
  scope?: Signalish<string | EmptyValue>
  abbr?: Signalish<string | EmptyValue>
}

export interface TimeHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  dateTime?: Signalish<string | EmptyValue>
}

export interface TrackHTMLAttributes<T extends HTMLElement> extends HTMLAttributes<T> {
  default?: Signalish<boolean | EmptyValue>
  kind?: Signalish<string | EmptyValue>
  label?: Signalish<string | EmptyValue>
  src?: Signalish<string | EmptyValue>
  srcLang?: Signalish<string | EmptyValue>
}

export interface VideoHTMLAttributes<T extends HTMLElement> extends MediaHTMLAttributes<T> {
  height?: Signalish<number | string | EmptyValue>
  playsInline?: Signalish<boolean | EmptyValue>
  poster?: Signalish<string | EmptyValue>
  width?: Signalish<number | string | EmptyValue>
  disablePictureInPicture?: Signalish<boolean | EmptyValue>
  disableRemotePlayback?: Signalish<boolean | EmptyValue>
}

// The three broad type categories are (in order of restrictiveness):
//   - "number | string"
//   - "string"
//   - union of string literals
export interface SVGAttributes<T extends Element> extends AriaAttributes, DOMAttributes<T> {
  // Attributes which also defined in HTMLAttributes
  // See comment in SVGDOMPropertyConfig.js
  class?: Signalish<string | EmptyValue>
  color?: Signalish<string | EmptyValue>
  height?: Signalish<number | string | EmptyValue>
  id?: Signalish<string | EmptyValue>
  lang?: Signalish<string | EmptyValue>
  max?: Signalish<number | string | EmptyValue>
  media?: Signalish<string | EmptyValue>
  method?: Signalish<string | EmptyValue>
  min?: Signalish<number | string | EmptyValue>
  name?: Signalish<string | EmptyValue>
  style?: Signalish<string | EmptyValue>
  target?: Signalish<string | EmptyValue>
  type?: Signalish<string | EmptyValue>
  width?: Signalish<number | string | EmptyValue>

  // Other HTML properties supported by SVG elements in browsers
  role?: Signalish<AriaRole | EmptyValue>
  tabIndex?: Signalish<number | EmptyValue>
  crossOrigin?: Signalish<CrossOrigin>

  // SVG Specific attributes
  accentHeight?: Signalish<number | string | EmptyValue>
  accumulate?: Signalish<'none' | 'sum' | EmptyValue>
  additive?: Signalish<'replace' | 'sum' | EmptyValue>
  alignmentBaseline?: Signalish<
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
  allowReorder?: Signalish<'no' | 'yes' | EmptyValue>
  alphabetic?: Signalish<number | string | EmptyValue>
  amplitude?: Signalish<number | string | EmptyValue>
  arabicForm?: Signalish<'initial' | 'medial' | 'terminal' | 'isolated' | EmptyValue>
  ascent?: Signalish<number | string | EmptyValue>
  attributeName?: Signalish<string | EmptyValue>
  attributeType?: Signalish<string | EmptyValue>
  autoReverse?: Signalish<Booleanish | EmptyValue>
  azimuth?: Signalish<number | string | EmptyValue>
  baseFrequency?: Signalish<number | string | EmptyValue>
  baselineShift?: Signalish<number | string | EmptyValue>
  baseProfile?: Signalish<number | string | EmptyValue>
  bbox?: Signalish<number | string | EmptyValue>
  begin?: Signalish<number | string | EmptyValue>
  bias?: Signalish<number | string | EmptyValue>
  by?: Signalish<number | string | EmptyValue>
  calcMode?: Signalish<number | string | EmptyValue>
  capHeight?: Signalish<number | string | EmptyValue>
  clip?: Signalish<number | string | EmptyValue>
  clipPath?: Signalish<string | EmptyValue>
  clipPathUnits?: Signalish<number | string | EmptyValue>
  clipRule?: Signalish<number | string | EmptyValue>
  colorInterpolation?: Signalish<number | string | EmptyValue>
  colorInterpolationFilters?: Signalish<'auto' | 'sRGB' | 'linearRGB' | 'inherit' | EmptyValue>
  colorProfile?: Signalish<number | string | EmptyValue>
  colorRendering?: Signalish<number | string | EmptyValue>
  contentScriptType?: Signalish<number | string | EmptyValue>
  contentStyleType?: Signalish<number | string | EmptyValue>
  cursor?: Signalish<number | string | EmptyValue>
  cx?: Signalish<number | string | EmptyValue>
  cy?: Signalish<number | string | EmptyValue>
  d?: Signalish<string | EmptyValue>
  decelerate?: Signalish<number | string | EmptyValue>
  descent?: Signalish<number | string | EmptyValue>
  diffuseConstant?: Signalish<number | string | EmptyValue>
  direction?: Signalish<number | string | EmptyValue>
  display?: Signalish<number | string | EmptyValue>
  divisor?: Signalish<number | string | EmptyValue>
  dominantBaseline?: Signalish<number | string | EmptyValue>
  dur?: Signalish<number | string | EmptyValue>
  dx?: Signalish<number | string | EmptyValue>
  dy?: Signalish<number | string | EmptyValue>
  edgeMode?: Signalish<number | string | EmptyValue>
  elevation?: Signalish<number | string | EmptyValue>
  enableBackground?: Signalish<number | string | EmptyValue>
  end?: Signalish<number | string | EmptyValue>
  exponent?: Signalish<number | string | EmptyValue>
  externalResourcesRequired?: Signalish<Booleanish | EmptyValue>
  fill?: Signalish<string | EmptyValue>
  fillOpacity?: Signalish<number | string | EmptyValue>
  fillRule?: Signalish<'nonzero' | 'evenodd' | 'inherit' | EmptyValue>
  filter?: Signalish<string | EmptyValue>
  filterRes?: Signalish<number | string | EmptyValue>
  filterUnits?: Signalish<number | string | EmptyValue>
  floodColor?: Signalish<number | string | EmptyValue>
  floodOpacity?: Signalish<number | string | EmptyValue>
  focusable?: Signalish<Booleanish | 'auto' | EmptyValue>
  fontFamily?: Signalish<string | EmptyValue>
  fontSize?: Signalish<number | string | EmptyValue>
  fontSizeAdjust?: Signalish<number | string | EmptyValue>
  fontStretch?: Signalish<number | string | EmptyValue>
  fontStyle?: Signalish<number | string | EmptyValue>
  fontVariant?: Signalish<number | string | EmptyValue>
  fontWeight?: Signalish<number | string | EmptyValue>
  format?: Signalish<number | string | EmptyValue>
  fr?: Signalish<number | string | EmptyValue>
  from?: Signalish<number | string | EmptyValue>
  fx?: Signalish<number | string | EmptyValue>
  fy?: Signalish<number | string | EmptyValue>
  g1?: Signalish<number | string | EmptyValue>
  g2?: Signalish<number | string | EmptyValue>
  glyphName?: Signalish<number | string | EmptyValue>
  glyphOrientationHorizontal?: Signalish<number | string | EmptyValue>
  glyphOrientationVertical?: Signalish<number | string | EmptyValue>
  glyphRef?: Signalish<number | string | EmptyValue>
  gradientTransform?: Signalish<string | EmptyValue>
  gradientUnits?: Signalish<string | EmptyValue>
  hanging?: Signalish<number | string | EmptyValue>
  horizAdvX?: Signalish<number | string | EmptyValue>
  horizOriginX?: Signalish<number | string | EmptyValue>
  href?: Signalish<string | EmptyValue>
  ideographic?: Signalish<number | string | EmptyValue>
  imageRendering?: Signalish<number | string | EmptyValue>
  in2?: Signalish<number | string | EmptyValue>
  in?: Signalish<string | EmptyValue>
  intercept?: Signalish<number | string | EmptyValue>
  k1?: Signalish<number | string | EmptyValue>
  k2?: Signalish<number | string | EmptyValue>
  k3?: Signalish<number | string | EmptyValue>
  k4?: Signalish<number | string | EmptyValue>
  k?: Signalish<number | string | EmptyValue>
  kernelMatrix?: Signalish<number | string | EmptyValue>
  kernelUnitLength?: Signalish<number | string | EmptyValue>
  kerning?: Signalish<number | string | EmptyValue>
  keyPoints?: Signalish<number | string | EmptyValue>
  keySplines?: Signalish<number | string | EmptyValue>
  keyTimes?: Signalish<number | string | EmptyValue>
  lengthAdjust?: Signalish<number | string | EmptyValue>
  letterSpacing?: Signalish<number | string | EmptyValue>
  lightingColor?: Signalish<number | string | EmptyValue>
  limitingConeAngle?: Signalish<number | string | EmptyValue>
  local?: Signalish<number | string | EmptyValue>
  markerEnd?: Signalish<string | EmptyValue>
  markerHeight?: Signalish<number | string | EmptyValue>
  markerMid?: Signalish<string | EmptyValue>
  markerStart?: Signalish<string | EmptyValue>
  markerUnits?: Signalish<number | string | EmptyValue>
  markerWidth?: Signalish<number | string | EmptyValue>
  mask?: Signalish<string | EmptyValue>
  maskContentUnits?: Signalish<number | string | EmptyValue>
  maskUnits?: Signalish<number | string | EmptyValue>
  mathematical?: Signalish<number | string | EmptyValue>
  mode?: Signalish<number | string | EmptyValue>
  numOctaves?: Signalish<number | string | EmptyValue>
  offset?: Signalish<number | string | EmptyValue>
  opacity?: Signalish<number | string | EmptyValue>
  operator?: Signalish<number | string | EmptyValue>
  order?: Signalish<number | string | EmptyValue>
  orient?: Signalish<number | string | EmptyValue>
  orientation?: Signalish<number | string | EmptyValue>
  origin?: Signalish<number | string | EmptyValue>
  overflow?: Signalish<number | string | EmptyValue>
  overlinePosition?: Signalish<number | string | EmptyValue>
  overlineThickness?: Signalish<number | string | EmptyValue>
  paintOrder?: Signalish<number | string | EmptyValue>
  panose1?: Signalish<number | string | EmptyValue>
  path?: Signalish<string | EmptyValue>
  pathLength?: Signalish<number | string | EmptyValue>
  patternContentUnits?: Signalish<string | EmptyValue>
  patternTransform?: Signalish<number | string | EmptyValue>
  patternUnits?: Signalish<string | EmptyValue>
  pointerEvents?: Signalish<number | string | EmptyValue>
  points?: Signalish<string | EmptyValue>
  pointsAtX?: Signalish<number | string | EmptyValue>
  pointsAtY?: Signalish<number | string | EmptyValue>
  pointsAtZ?: Signalish<number | string | EmptyValue>
  preserveAlpha?: Signalish<Booleanish | EmptyValue>
  preserveAspectRatio?: Signalish<string | EmptyValue>
  primitiveUnits?: Signalish<number | string | EmptyValue>
  r?: Signalish<number | string | EmptyValue>
  radius?: Signalish<number | string | EmptyValue>
  refX?: Signalish<number | string | EmptyValue>
  refY?: Signalish<number | string | EmptyValue>
  renderingIntent?: Signalish<number | string | EmptyValue>
  repeatCount?: Signalish<number | string | EmptyValue>
  repeatDur?: Signalish<number | string | EmptyValue>
  requiredExtensions?: Signalish<number | string | EmptyValue>
  requiredFeatures?: Signalish<number | string | EmptyValue>
  restart?: Signalish<number | string | EmptyValue>
  result?: Signalish<string | EmptyValue>
  rotate?: Signalish<number | string | EmptyValue>
  rx?: Signalish<number | string | EmptyValue>
  ry?: Signalish<number | string | EmptyValue>
  scale?: Signalish<number | string | EmptyValue>
  seed?: Signalish<number | string | EmptyValue>
  shapeRendering?: Signalish<number | string | EmptyValue>
  slope?: Signalish<number | string | EmptyValue>
  spacing?: Signalish<number | string | EmptyValue>
  specularConstant?: Signalish<number | string | EmptyValue>
  specularExponent?: Signalish<number | string | EmptyValue>
  speed?: Signalish<number | string | EmptyValue>
  spreadMethod?: Signalish<string | EmptyValue>
  startOffset?: Signalish<number | string | EmptyValue>
  stdDeviation?: Signalish<number | string | EmptyValue>
  stemh?: Signalish<number | string | EmptyValue>
  stemv?: Signalish<number | string | EmptyValue>
  stitchTiles?: Signalish<number | string | EmptyValue>
  stopColor?: Signalish<string | EmptyValue>
  stopOpacity?: Signalish<number | string | EmptyValue>
  strikethroughPosition?: Signalish<number | string | EmptyValue>
  strikethroughThickness?: Signalish<number | string | EmptyValue>
  string?: Signalish<number | string | EmptyValue>
  stroke?: Signalish<string | EmptyValue>
  strokeDasharray?: Signalish<string | number | EmptyValue>
  strokeDashoffset?: Signalish<string | number | EmptyValue>
  strokeLinecap?: Signalish<'butt' | 'round' | 'square' | 'inherit' | EmptyValue>
  strokeLinejoin?: Signalish<'miter' | 'round' | 'bevel' | 'inherit' | EmptyValue>
  strokeMiterlimit?: Signalish<number | string | EmptyValue>
  strokeOpacity?: Signalish<number | string | EmptyValue>
  strokeWidth?: Signalish<number | string | EmptyValue>
  surfaceScale?: Signalish<number | string | EmptyValue>
  systemLanguage?: Signalish<number | string | EmptyValue>
  tableValues?: Signalish<number | string | EmptyValue>
  targetX?: Signalish<number | string | EmptyValue>
  targetY?: Signalish<number | string | EmptyValue>
  textAnchor?: Signalish<string | EmptyValue>
  textDecoration?: Signalish<number | string | EmptyValue>
  textLength?: Signalish<number | string | EmptyValue>
  textRendering?: Signalish<number | string | EmptyValue>
  to?: Signalish<number | string | EmptyValue>
  transform?: Signalish<string | EmptyValue>
  u1?: Signalish<number | string | EmptyValue>
  u2?: Signalish<number | string | EmptyValue>
  underlinePosition?: Signalish<number | string | EmptyValue>
  underlineThickness?: Signalish<number | string | EmptyValue>
  unicode?: Signalish<number | string | EmptyValue>
  unicodeBidi?: Signalish<number | string | EmptyValue>
  unicodeRange?: Signalish<number | string | EmptyValue>
  unitsPerEm?: Signalish<number | string | EmptyValue>
  vAlphabetic?: Signalish<number | string | EmptyValue>
  values?: Signalish<string | EmptyValue>
  vectorEffect?: Signalish<number | string | EmptyValue>
  version?: Signalish<string | EmptyValue>
  vertAdvY?: Signalish<number | string | EmptyValue>
  vertOriginX?: Signalish<number | string | EmptyValue>
  vertOriginY?: Signalish<number | string | EmptyValue>
  vHanging?: Signalish<number | string | EmptyValue>
  vIdeographic?: Signalish<number | string | EmptyValue>
  viewBox?: Signalish<string | EmptyValue>
  viewTarget?: Signalish<number | string | EmptyValue>
  visibility?: Signalish<number | string | EmptyValue>
  vMathematical?: Signalish<number | string | EmptyValue>
  widths?: Signalish<number | string | EmptyValue>
  wordSpacing?: Signalish<number | string | EmptyValue>
  writingMode?: Signalish<number | string | EmptyValue>
  x1?: Signalish<number | string | EmptyValue>
  x2?: Signalish<number | string | EmptyValue>
  x?: Signalish<number | string | EmptyValue>
  xChannelSelector?: Signalish<string | EmptyValue>
  xHeight?: Signalish<number | string | EmptyValue>
  xlinkActuate?: Signalish<string | EmptyValue>
  xlinkArcrole?: Signalish<string | EmptyValue>
  xlinkHref?: Signalish<string | EmptyValue>
  xlinkRole?: Signalish<string | EmptyValue>
  xlinkShow?: Signalish<string | EmptyValue>
  xlinkTitle?: Signalish<string | EmptyValue>
  xlinkType?: Signalish<string | EmptyValue>
  xmlBase?: Signalish<string | EmptyValue>
  xmlLang?: Signalish<string | EmptyValue>
  xmlns?: Signalish<string | EmptyValue>
  xmlnsXlink?: Signalish<string | EmptyValue>
  xmlSpace?: Signalish<string | EmptyValue>
  y1?: Signalish<number | string | EmptyValue>
  y2?: Signalish<number | string | EmptyValue>
  y?: Signalish<number | string | EmptyValue>
  yChannelSelector?: Signalish<string | EmptyValue>
  z?: Signalish<number | string | EmptyValue>
  zoomAndPan?: Signalish<string | EmptyValue>
}
