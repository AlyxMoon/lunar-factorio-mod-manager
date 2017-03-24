export function setRoutes (routes) {
  return {
    type: 'SET_ROUTES',
    routes
  }
}
export function setActiveTab (tab) {
  return {
    type: 'SET_ACTIVE_TAB',
    tab
  }
}