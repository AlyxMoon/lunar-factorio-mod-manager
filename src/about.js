export function setAppCurrentVersion (state, version) {
  return state.set('appCurrentVersion', version)
}

export function setAppLatestVersion (state, version) {
  return state.set('appLatestVersion', version)
}
