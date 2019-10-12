import { isVersionHigher } from 'src/shared/isVersionHigher'

export const currentProfile = (state) => () => {
  if (state.profiles && state.profiles.length > 0 && state.activeProfile >= 0) {
    return state.profiles[state.activeProfile]
  }
}

export const isModMissingDependenciesInActiveProfile = (state) => (modName) => {
  const profile = state.profiles[state.activeProfile]
  if (!profile) return

  const installedMods = state.installedMods
  if (!installedMods) return true

  const mod = installedMods.find(m => m.name === modName)
  if (!mod) return false

  return mod.dependenciesParsed
    .some(d => d.type === 'required' && profile.mods.findIndex(m => m.name === d.name) === -1)
}

export const isModUpdateAvailable = (state) => (modName) => {
  if (!state.installedMods || state.installedMods.length === 0) return false
  if (!state.onlineMods || !state.onlineMods.length === 0) return false
  if (!modName) return false

  const installedMod = state.installedMods.find(m => m.name === modName)
  const onlineMod = state.onlineMods.find(m => m.name === modName)

  return (installedMod && onlineMod)
    ? isVersionHigher(installedMod.version, onlineMod.latest_release.version)
    : false
}

export const getInstalledInfoForMod = (state) => (modName) => {
  if (!state.installedMods || state.installedMods.length === 0) return
  if (!modName) return

  return state.installedMods.find(m => m.name === modName)
}

export const getOnlineInfoForMod = (state) => (mod) => {
  if (!state.onlineMods || state.onlineMods.length === 0) return
  if (!mod || !mod.name) return

  return state.onlineMods.find(m => m.name === mod.name)
}

export const isModInCurrentProfile = (state, getters) => (mod) => {
  return (getters.currentProfile() || { mods: [] }).mods.some(m => m.name === mod.name)
}

export const filterModDependenciesByType = () => (mod, type = 'required') => {
  return mod.dependenciesParsed.filter(dependency => dependency.type === type)
}

export const search = (state, getters) => (query, mods) => {
  return mods.filter(mod => mod.title.toLowerCase().search(query.toLowerCase()) > -1)
}

export const onlineMods = (state, getters) => {
  if (!state.onlineMods || !state.onlineMods.length === 0) return []

  let mods = state.onlineModsCurrentFilter === 'all'
    ? state.onlineMods
    : state.onlineMods.filter(mod => mod.category === state.onlineModsCurrentFilter)

  mods = state.onlineQuery === ''
    ? mods
    : getters.search(state.onlineQuery, mods)

  return mods
    .concat()
    .sort((a, b) => {
      if (state.onlineModsCurrentSort === 'a-z') {
        if (a.title < b.title) return -1
        if (a.title > b.title) return 1
        return 0
      }
      if (state.onlineModsCurrentSort === 'popular-most') {
        if (a.downloads_count > b.downloads_count) return -1
        if (a.downloads_count < b.downloads_count) return 1
        return 0
      }
      if (state.onlineModsCurrentSort === 'recent-most') {
        if (a.latest_release.released_at > b.latest_release.released_at) return -1
        if (a.latest_release.released_at < b.latest_release.released_at) return 1
        return 0
      }
      if (state.onlineModsCurrentSort === 'trending-most') {
        if (a.score > b.score) return -1
        if (a.score < b.score) return 1
        return 0
      }
    })
}

export const currentlyDisplayedOnlineMods = (state, getters) => {
  if (!state.onlineMods || !state.onlineMods.length === 0) return []

  const { onlineModsItemPerPage, onlineModsPage } = state
  const startIndex = onlineModsPage * onlineModsItemPerPage

  return getters.onlineMods.slice(startIndex, startIndex + onlineModsItemPerPage)
}

export const onlineModsCount = (state, getters) => {
  return getters.onlineMods.length
}

export const maxPageOnlineMods = (state, getters) => {
  if (!state.onlineMods || !state.onlineMods.length === 0) return 0

  return Math.floor(getters.onlineModsCount / state.onlineModsItemPerPage) - 1
}

export const isModDownloaded = (state) => (name) => {
  if (!name || !state.installedMods) return false

  return state.installedMods.some(mod => mod.name === name)
}
