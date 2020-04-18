import { ipcRenderer } from 'electron'
import Vue from 'vue'
import VueElectron from 'vue-electron'
import { ADD_TOAST_MESSAGE } from 'vuex-toast'

import App from './App'
import router from './router'
import store from './store'

import '@fortawesome/fontawesome-free/css/all.min.css'
import 'vuex-toast/dist/vuex-toast.css'
import './assets/style/main.scss'

const isDev = process.env.NODE_ENV === 'development'

Vue.use(VueElectron)

Vue.config.devtools = isDev
Vue.config.performance = isDev
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: r => r(App),
})

ipcRenderer.on('CHANGE_VIEW', (event, data) => {
  if (data.route) {
    router.push(data.route)
  }
})

ipcRenderer.on('ADD_TOAST', (event, data) => {
  if (!data.text) return

  const toastData = {
    text: data.text,
    type: data.type || 'success',
    dismissAfter: data.dismissAfter || 8000,
  }

  store.dispatch(ADD_TOAST_MESSAGE, toastData)
})

ipcRenderer.on('PLAYER_USERNAME', (event, data) => {
  store.commit('SET_PLAYER_USERNAME', { username: data })
})

ipcRenderer.on('INSTALLED_MODS', (event, data) => {
  store.commit('SET_INSTALLED_MODS', { installedMods: data })
  store.dispatch('selectInstalledMod', (store.state.selectedMod || { name: '' }).name)
})

ipcRenderer.on('ONLINE_MODS', (event, data) => {
  store.commit('SET_ONLINE_MODS', { onlineMods: data })
})

ipcRenderer.on('FACTORIO_SAVES', (event, data) => {
  store.commit('SET_SAVES', { saves: data })
})

ipcRenderer.on('PROFILES_LIST', (event, data) => {
  store.commit('SET_PROFILES', { profiles: data })
})

ipcRenderer.on('PROFILES_ACTIVE', (event, data) => {
  store.commit('SET_ACTIVE_PROFILE', { activeProfile: data })
})

ipcRenderer.on('APP_OPTIONS', (event, data) => {
  console.log('got options', data)
  store.commit('UPDATE_OPTIONS', { options: data })
})

if (isDev) {
  // Normally won't need to call these events
  // but during development if renderer code is reloaded then the app won't send info again and that's annoying
  ipcRenderer.send('REQUEST_PLAYER_USERNAME')
  ipcRenderer.send('REQUEST_INSTALLED_MODS')
  ipcRenderer.send('REQUEST_ONLINE_MODS')
  ipcRenderer.send('REQUEST_PROFILES')
  ipcRenderer.send('REQUEST_OPTIONS')
}
