export const SET_PLAYER_USERNAME = (state, payload) => {
  state.username = payload.username
}

export const SET_INSTALLED_MODS = (state, payload) => {
  state.installedMods = payload.installedMods
}

export const SET_ONLINE_MODS = (state, payload) => {
  state.onlineMods = payload.onlineMods
}

export const SET_ACTIVE_PROFILE = (state, payload) => {
  state.activeProfile = payload.activeProfile
}

export const SET_PROFILES = (state, payload) => {
  state.profiles = payload.profiles
}

export const TOGGLE_EDIT_PROFILE = (state) => {
  state.editingProfile = !state.editingProfile
}

export const SET_CURRENT_ONLINE_MOD_FILTER = (state, payload) => {
  state.onlineModsCurrentFilter = payload.onlineModsCurrentFilter
  state.onlineModsPage = 0
}

export const SET_CURRENT_ONLINE_MOD_SORT = (state, payload) => {
  state.onlineModsCurrentSort = payload.onlineModsCurrentSort
  state.onlineModsPage = 0
}

export const SET_SELECTED_MOD = (state, payload) => {
  state.selectedMod = payload.selectedMod
}

export const SET_SELECTED_ONLINE_MOD = (state, payload) => {
  state.selectedOnlineMod = payload.selectedOnlineMod
}

export const SET_ONLINE_MODS_PAGE = (state, payload) => {
  state.onlineModsPage = payload.onlineModsPage
}

export const SET_ONLINE_QUERY = (state, payload) => {
  state.onlineQuery = payload.onlineQuery
}
