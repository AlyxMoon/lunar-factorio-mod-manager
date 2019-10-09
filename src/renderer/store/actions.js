import { ipcRenderer } from 'electron'
import { debounce } from 'src/shared/debounce'

export const startFactorio = (context) => {
  ipcRenderer.send('START_FACTORIO')
}

export const fetchOnlineMods = (context, force = false) => {
  ipcRenderer.send('FETCH_ONLINE_MODS', force)
}

export const downloadMod = (context, mod) => {
  ipcRenderer.send('DOWNLOAD_MOD', mod.name, mod.title, mod.latest_release.version, mod.latest_release.download_url)
}

export const deleteMod = (context, name) => {
  ipcRenderer.send('DELETE_MOD', name)
  context.commit('SET_SELECTED_MOD', { selectedMod: undefined })
}

export const setActiveProfile = (context, index) => {
  ipcRenderer.send('SET_ACTIVE_PROFILE', Number(index))
}

export const addModToCurrentProfile = (context, mod) => {
  ipcRenderer.send('ADD_MOD_TO_CURRENT_PROFILE', mod)
}

export const removeModFromCurrentProfile = (context, mod) => {
  ipcRenderer.send('REMOVE_MOD_FROM_CURRENT_PROFILE', mod)
}

export const addProfile = (context) => {
  ipcRenderer.send('ADD_PROFILE')
}

export const updateCurrentProfile = debounce((context, data) => {
  const profile = Object.assign({ ...context.getters.currentProfile() }, data)
  ipcRenderer.send('UPDATE_CURRENT_PROFILE', profile)
})

export const toggleEditProfile = (context) => {
  context.commit('TOGGLE_EDIT_PROFILE')
}

export const removeCurrentProfile = (context) => {
  ipcRenderer.send('REMOVE_CURRENT_PROFILE')
}

export const setCurrentOnlineModFilter = (context, filter) => {
  context.commit('SET_CURRENT_ONLINE_MOD_FILTER', { onlineModsCurrentFilter: filter })
}

export const setCurrentOnlineModSort = (context, sort) => {
  context.commit('SET_CURRENT_ONLINE_MOD_SORT', { onlineModsCurrentSort: sort })
}

export const setOnlineQuery = (context, query) => {
  context.commit('SET_ONLINE_QUERY', { onlineQuery: query })
}

export const selectInstalledMod = (context, name) => {
  const mod = context.state.installedMods.find(m => m.name === name)
  context.commit('SET_SELECTED_MOD', { selectedMod: mod })
}

export const selectOnlineMod = (context, mod) => {
  context.commit('SET_SELECTED_ONLINE_MOD', { selectedOnlineMod: mod })
}

export const decrementCurrentOnlineModsPage = (context) => {
  const newPage = context.state.onlineModsPage - 1 > 0
    ? context.state.onlineModsPage - 1
    : 0
  context.commit('SET_ONLINE_MODS_PAGE', { onlineModsPage: newPage })
}

export const incrementCurrentOnlineModsPage = (context) => {
  const newPage = context.state.onlineModsPage + 1 > context.getters.maxPageOnlineMods
    ? context.getters.maxPageOnlineMods
    : context.state.onlineModsPage + 1
  context.commit('SET_ONLINE_MODS_PAGE', { onlineModsPage: newPage })
}

export const goToFirstOnlineModsPage = (context) => {
  context.commit('SET_ONLINE_MODS_PAGE', { onlineModsPage: 0 })
}

export const goToLastOnlineModsPage = (context) => {
  context.commit('SET_ONLINE_MODS_PAGE', { onlineModsPage: context.getters.maxPageOnlineMods })
}
