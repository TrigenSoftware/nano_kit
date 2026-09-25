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
  'map',
  'moon',
  'pause',
  'play',
  'search',
  'selector',
  'signal',
  'spark',
  'sun',
  'token'
] as const

export type IconName = typeof icons[number]
