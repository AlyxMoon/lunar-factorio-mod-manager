export function setPlayerName (state, playerName) {
  return state.set('playerName', playerName)
}

export function setOnlineModsFetchedCount (state, count) {
  return state.set('onlineModsFetchedCount', count)
}

export function setOnlineModsCount (state, count) {
  return state.set('onlineModsCount', count)
}

export function setFactorioVersion (state, version) {
  return state.set('factorioVersion', version)
}
