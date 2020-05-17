import Vue from 'vue'
import Router from 'vue-router'

import About from '@/pages/About'
import FirstRun from '@/pages/FirstRun'
import Options from '@/pages/Options'
import Portal from '@/pages/Portal'
import Profiles from '@/pages/Profiles'
import Saves from '@/pages/Saves'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/about',
      component: About,
    },
    {
      path: '/firstrun',
      name: 'PageFirstRun',
      component: FirstRun,
    },
    {
      path: '/options',
      component: Options,
    },
    {
      path: '/portal',
      component: Portal,
    },
    {
      path: '/saves',
      component: Saves,
    },
    {
      path: '/profiles',
      name: 'PageProfiles',
      component: Profiles,
      alias: ['/', '*'],
    },
  ],
})

export default router
