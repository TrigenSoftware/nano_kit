export function pageFromSearch(value: unknown) {
  const page = Number(value)

  return Number.isInteger(page) && page > 0 ? page : 1
}

export function idFromParam(value: string) {
  const id = Number(value)

  if (!Number.isInteger(id) || id < 1) {
    throw new Error('Invalid route param')
  }

  return id
}
