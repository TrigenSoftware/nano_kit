const ADJECTIVES = [
  'amber',
  'ashen',
  'bold',
  'brave',
  'brisk',
  'calm',
  'clever',
  'cosmic',
  'crisp',
  'dapper',
  'dusky',
  'eager',
  'early',
  'faint',
  'fancy',
  'fleet',
  'fuzzy',
  'gentle',
  'glad',
  'golden',
  'hazy',
  'hidden',
  'humble',
  'icy',
  'jolly',
  'keen',
  'kind',
  'lively',
  'lucid',
  'lunar',
  'mellow',
  'misty',
  'modest',
  'nimble',
  'noble',
  'odd',
  'pale',
  'plucky',
  'proud',
  'quick',
  'quiet',
  'rapid',
  'royal',
  'rustic',
  'sandy',
  'shy',
  'silent',
  'silver',
  'sleek',
  'snowy',
  'soft',
  'solar',
  'spry',
  'steady',
  'stormy',
  'sunny',
  'swift',
  'tidy',
  'vivid',
  'warm',
  'wild',
  'windy',
  'witty',
  'zesty'
]
const ANIMALS = [
  'badger',
  'bat',
  'bear',
  'beaver',
  'bison',
  'boar',
  'camel',
  'cobra',
  'crab',
  'crane',
  'crow',
  'deer',
  'dingo',
  'dove',
  'eagle',
  'eel',
  'falcon',
  'finch',
  'fox',
  'frog',
  'gecko',
  'goat',
  'goose',
  'hare',
  'hawk',
  'heron',
  'horse',
  'ibis',
  'jackal',
  'jay',
  'koala',
  'lark',
  'lemur',
  'lion',
  'lynx',
  'magpie',
  'mole',
  'moose',
  'moth',
  'newt',
  'otter',
  'owl',
  'panda',
  'parrot',
  'pike',
  'puma',
  'quail',
  'rabbit',
  'raven',
  'robin',
  'seal',
  'shark',
  'shrew',
  'snail',
  'sparrow',
  'stoat',
  'swan',
  'tiger',
  'toad',
  'trout',
  'vole',
  'walrus',
  'wolf',
  'wren'
]
const FNV_OFFSET = 2166136261
const FNV_PRIME = 16777619

/**
 * FNV-1a over the UTF-16 units of a string.
 * @param text
 * @returns An unsigned 32-bit hash.
 */
export function hash(text: string) {
  let result = FNV_OFFSET

  for (let i = 0, len = text.length; i < len; i++) {
    result = Math.imul(result ^ text.charCodeAt(i), FNV_PRIME)
  }

  return result >>> 0
}

/**
 * A name in the style of Docker containers, `quiet-otter`: the same seed gives the same name,
 * so a node keeps its name across reloads for as long as the code that creates it does not move.
 * @param seed
 * @returns Two words joined with a dash.
 */
export function moniker(seed: string) {
  const value = hash(seed)

  return `${ADJECTIVES[value % ADJECTIVES.length]}-${ANIMALS[Math.floor(value / ADJECTIVES.length) % ANIMALS.length]}`
}
