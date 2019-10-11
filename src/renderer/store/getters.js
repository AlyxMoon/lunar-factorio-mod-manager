export const currentProfile = (state) => () => {
  if (state.profiles && state.profiles.length > 0 && state.activeProfile >= 0) {
    return state.profiles[state.activeProfile]
  }
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

export const maxPageOnlineMods = (state, getters) => {
  if (!state.onlineMods || !state.onlineMods.length === 0) return 0

  return Math.floor(getters.onlineMods.length / state.onlineModsItemPerPage) - 1
}

export const isModDownloaded = (state) => (name) => {
  if (!name || !state.installedMods) return false

  return state.installedMods.some(mod => mod.name === name)
}
