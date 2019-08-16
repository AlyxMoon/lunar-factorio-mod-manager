import Vue from 'vue'
import Router from 'vue-router'

import Profiles from '@/pages/Profiles'

const Mods = Vue.component('Mods', { template: '<h1>Mods</h1>' })
const Saves = Vue.component('Saves', { template: '<h1>Saves</h1>' })
const Portal = Vue.component('Portal', { template: '<h1>Portal</h1>' })

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/profiles',
    },
    {
      path: '/profiles',
      component: Profiles,
    },
    {
      path: '/mods',
      component: Mods,
    },
    {
      path: '/saves',
      component: Saves,
    },
    {
      path: '/portal',
      component: Portal,
    },
    {
      path: '*',
      redirect: '/profiles',
    },
  ],
})

export default router
