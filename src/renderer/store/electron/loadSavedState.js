import { config, onlineModsCache } from '@shared/store'

const loadSavedState = (store) => {
  const existingState = config.get()

  store.commit('SET_INSTALLED_MODS', { installedMods: existingState.mods.installed })
  store.commit('UPDATE_OPTIONS', { options: existingState.options })
  store.commit('UPDATE_FACTORIO_PATHS', { paths: existingState.paths })
  store.commit('SET_PROFILES', { profiles: existingState.profiles.list })
  store.commit('SET_ACTIVE_PROFILE', { profileSelected: existingState.profiles.active })
  store.commit('SET_PLAYER_USERNAME', { username: existingState.player.username })

  store.commit('SET_ONLINE_MODS', { onlineMods: onlineModsCache.get('mods') })
}

export default loadSavedState
