import Vue from 'vue'
import Router from 'vue-router'

import Portal from '@/pages/Portal'
import Profiles from '@/pages/Profiles'

const Mods = Vue.component('Mods', { template: '<div></div>' })
const Saves = Vue.component('Saves', { template: '<div></div>' })

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
