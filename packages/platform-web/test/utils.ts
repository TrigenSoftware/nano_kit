const DEFAULT_WAIT_TIMEOUT = 60_000

export async function waitFor(
  assertion: () => void | Promise<void>,
  timeout = DEFAULT_WAIT_TIMEOUT
) {
  let error: unknown
  const deadline = Date.now() + timeout

  for (;;) {
    try {
      await assertion()
      return
    } catch (nextError) {
      error = nextError

      if (Date.now() >= deadline) {
        throw error
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}
