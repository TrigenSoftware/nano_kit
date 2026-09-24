export const icons = [
  'chevron-down',
  'chevron-right',
  'child',
  'clear',
  'close',
  'computed',
  'effect',
  'file',
  'grip',
  'moon',
  'pause',
  'search',
  'selector',
  'signal',
  'spark',
  'sun',
  'token'
] as const

export type IconName = typeof icons[number]
