export const SET_INSTALLED_MODS = (state, payload) => {
  state.installedMods = payload.installedMods
}

export const SET_ACTIVE_PROFILE = (state, payload) => {
  state.activeProfile = payload.activeProfile
}

export const SET_PROFILES = (state, payload) => {
  state.profiles = payload.profiles
}

export const SET_SELECTED_MOD = (state, payload) => {
  state.selectedMod = payload.selectedMod
}
