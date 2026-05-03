let authLayoutRenders = 0
let authShortLayoutRenders = 0
let dashboardLayoutRenders = 0

export function resetAuthLayoutRenders() {
  authLayoutRenders = 0
}

export function nextAuthLayoutRender() {
  return ++authLayoutRenders
}

export function resetAuthShortLayoutRenders() {
  authShortLayoutRenders = 0
}

export function nextAuthShortLayoutRender() {
  return ++authShortLayoutRenders
}

export function resetDashboardLayoutRenders() {
  dashboardLayoutRenders = 0
}

export function nextDashboardLayoutRender() {
  return ++dashboardLayoutRenders
}
