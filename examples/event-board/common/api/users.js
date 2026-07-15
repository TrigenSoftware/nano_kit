/**
 * Demo users for the mock API. Credentials are shown on the login form.
 */
const users = [
  {
    id: 'u1',
    username: 'ada',
    password: 'lovelace',
    name: 'Ada Lovelace'
  },
  {
    id: 'u2',
    username: 'grace',
    password: 'hopper',
    name: 'Grace Hopper'
  }
]
/**
 * In-memory session storage: token -> user id.
 * Sessions reset on server restart, same as the rest of the mock data.
 */
const sessions = new Map()

/**
 * Find a user by credentials.
 * @param {string} username
 * @param {string} password
 * @returns {object | null} Matched user or `null` when credentials are invalid.
 */
export function authenticateUser(username, password) {
  if (typeof username !== 'string' || typeof password !== 'string') {
    return null
  }

  return users.find(
    user => user.username === username && user.password === password
  ) || null
}

/**
 * Create a session for a user.
 * @param {string} userId
 * @returns {string} Session token.
 */
export function createSession(userId) {
  const token = crypto.randomUUID()

  sessions.set(token, userId)

  return token
}

/**
 * Delete a session by token.
 * @param {string} token
 */
export function deleteSession(token) {
  sessions.delete(token)
}

/**
 * Find a user by session token.
 * @param {string | undefined} token
 * @returns {object | null} Session user or `null` when the session is invalid.
 */
export function findUserBySession(token) {
  const userId = token && sessions.get(token)

  if (!userId) {
    return null
  }

  return users.find(user => user.id === userId) || null
}

/**
 * Strip private fields from a user.
 * @param {object} user
 * @returns {{ id: string, username: string, name: string }} Public user payload.
 */
export function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name
  }
}
