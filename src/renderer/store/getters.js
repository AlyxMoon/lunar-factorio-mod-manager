export const currentProfile = (state) => () => {
  if (state.profiles && state.profiles.length > 0 && state.activeProfile >= 0) {
    return state.profiles[state.activeProfile]
  }
}

export const isModInCurrentProfile = (state, getters) => (mod) => {
  return (getters.currentProfile() || { mods: [] }).mods.some(m => m.name === mod.name)
}

export const currentlyDisplayedOnlineMods = (state) => {
  if (!state.onlineMods || !state.onlineMods.length === 0) return []

  const { onlineModsItemPerPage, onlineModsPage } = state
  const startIndex = onlineModsPage * onlineModsItemPerPage
  return state.onlineMods.slice(startIndex, startIndex + onlineModsItemPerPage)
}

export const maxPageOnlineMods = (state) => {
  if (!state.onlineMods || !state.onlineMods.length === 0) return 0

  return Math.floor(state.onlineMods.length / state.onlineModsItemPerPage) - 1
}
