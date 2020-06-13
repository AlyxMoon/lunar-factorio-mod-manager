import Vue from 'vue'
import VueElectron from 'vue-electron'

import App from './App'
import router from './router'
import store from './store'

import '@fortawesome/fontawesome-free/css/all.min.css'
import 'vuex-toast/dist/vuex-toast.css'
import './assets/style/main.scss'

import Tooltip from '@/components/partials/Tooltip'

const isDev = process.env.NODE_ENV === 'development'

Vue.use(VueElectron)
Vue.component('Tooltip', Tooltip)

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
