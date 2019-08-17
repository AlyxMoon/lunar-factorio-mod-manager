export const currentProfile = (state) => () => {
  if (state.profiles && state.profiles.length > 0 && state.activeProfile >= 0) {
    return state.profiles[state.activeProfile]
  }
}

export const isModInCurrentProfile = (state, getters) => (mod) => {
  return (getters.currentProfile() || { mods: [] }).mods.some(m => m.name === mod.name)
}
