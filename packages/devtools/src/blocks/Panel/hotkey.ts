/**
 * The shortcut that opens and collapses the panel, the way `aria-keyshortcuts` names it.
 */
export const HOTKEY = 'Alt+Shift+D'

/**
 * Whether a key press is the shortcut. The key is told by its place: on a Mac, Option turns the letter into
 * another one.
 * @param event - The key press.
 * @returns Whether it is the shortcut.
 */
export function isHotkey(event: KeyboardEvent) {
  return event.code === 'KeyD' && event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey
}

/**
 * The shortcut the way the keyboard of the user labels it.
 * @returns The label.
 */
export function hotkeyLabel() {
  return navigator.userAgent.includes('Mac') ? '⌥⇧D' : HOTKEY
}
