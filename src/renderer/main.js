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

// handle menu event updates from main script
ipcRenderer.on('change-view', (event, data) => {
  if (data.route) {
    router.push(data.route)
  }
})
