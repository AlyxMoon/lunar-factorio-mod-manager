import { ipcRenderer } from 'electron'
import Vue from 'vue'
import VueElectron from 'vue-electron'
import Toasted from 'vue-toasted'

import App from './App'
import router from './router'
import store from './store'

import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/style/main.scss'

const isDev = process.env.NODE_ENV === 'development'

Vue.use(VueElectron)
Vue.use(Toasted, {
  duration: 3000,
  Icon: 'info',
  iconPack: 'fontawesome',
  position: 'bottom-center',
  type: 'info',
})

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

ipcRenderer.on('INSTALLED_MODS', (event, data) => {
  store.commit('SET_INSTALLED_MODS', { installedMods: data })
})

ipcRenderer.on('PROFILES_LIST', (event, data) => {
  store.commit('SET_PROFILES', { profiles: data })
})

ipcRenderer.on('PROFILES_ACTIVE', (event, data) => {
  store.commit('SET_ACTIVE_PROFILE', { activeProfile: data })
})

if (isDev) {
  // Normally won't need to call these events
  // but during development if renderer code is reloaded then the app won't send info again and that's annoying
  ipcRenderer.send('REQUEST_INSTALLED_MODS')
  ipcRenderer.send('REQUEST_PROFILES')
}
