import { ipcRenderer } from 'electron'
import { ADD_TOAST_MESSAGE } from 'vuex-toast'

import router from '@/router'
import { config, onlineModsCache } from '@shared/store'

const configureAppWatchers = (store) => {
  ipcRenderer.on('ADD_TOAST', (event, data) => {
    if (!data.text) return

    const toastData = {
      text: data.text,
      type: data.type || 'success',
      dismissAfter: data.dismissAfter || 8000,
    }

    store.dispatch(ADD_TOAST_MESSAGE, toastData)
  })

  ipcRenderer.on('CHANGE_PAGE', (event, page) => {
    router.push({ name: page })
  })

  ipcRenderer.on('FACTORIO_SAVES', (event, saves) => {
    store.commit('SET_SAVES', { saves })
  })

  config.onDidChange('mods.installed', (data) => {
    store.dispatch('setInstalledMods', { mods: data })
  })

  config.onDidChange('options', (data) => {
    store.commit('UPDATE_OPTIONS', { options: data })
  })

  config.onDidChange('environments', (data) => {
    store.commit('UPDATE_ENVIRONMENTS', { environments: data })
  })

  config.onDidChange('environments.active', (data) => {
    store.commit('UPDATE_ENVIRONMENTS', { active: data })
  })

  config.onDidChange('environments.list', (data) => {
    store.commit('UPDATE_ENVIRONMENTS', { list: data })
  })

  config.onDidChange('player.username', (data) => {
    store.commit('SET_PLAYER_USERNAME', { username: data })
  })

  config.onDidChange('profiles.active', (data) => {
    store.commit('SET_ACTIVE_PROFILE', { profileSelected: data })

    const name = store.state.profiles[store.state.profileSelected].environment
    const environments = store.state.environments.list
    if (environments && name) {
      const index = environments.findIndex(env => env.name === name)
      if (index > -1) config.set('environments.active', index)
    }
  })

  config.onDidChange('profiles.list', (data) => {
    store.commit('SET_PROFILES', { profiles: data })
  })

  onlineModsCache.onDidChange('mods', (data) => {
    store.commit('SET_ONLINE_MODS', { onlineMods: data })
  })

  return store
}

export default configureAppWatchers
