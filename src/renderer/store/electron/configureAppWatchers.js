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

  config.onDidChange('paths', (data) => {
    store.commit('UPDATE_FACTORIO_PATHS', { paths: data })
  })

  config.onDidChange('paths.factorioDataDir', (data) => {
    store.commit('UPDATE_FACTORIO_PATHS', { paths: { factorioDataDir: data } })
  })
  config.onDidChange('paths.factorioExe', (data) => {
    store.commit('UPDATE_FACTORIO_PATHS', { paths: { factorioExe: data } })
  })
  config.onDidChange('paths.modDir', (data) => {
    store.commit('UPDATE_FACTORIO_PATHS', { paths: { modDir: data } })
  })
  config.onDidChange('paths.playerDataFile', (data) => {
    store.commit('UPDATE_FACTORIO_PATHS', { paths: { playerDataFile: data } })
  })
  config.onDidChange('paths.saveDir', (data) => {
    store.commit('UPDATE_FACTORIO_PATHS', { paths: { saveDir: data } })
  })

  config.onDidChange('player.username', (data) => {
    store.commit('SET_PLAYER_USERNAME', { username: data })
  })

  config.onDidChange('profiles.active', (data) => {
    store.commit('SET_ACTIVE_PROFILE', { profileSelected: data })
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
