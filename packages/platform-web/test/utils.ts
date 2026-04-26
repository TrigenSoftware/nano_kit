export async function waitFor(assertion: () => void | Promise<void>) {
  let error: unknown

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  for (let i = 0; i < 20; i++) {
    try {
      await assertion()
      return
    } catch (nextError) {
      error = nextError
      await new Promise(resolve => setTimeout(resolve))
    }
  }

  throw error
}
