import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home.vue'

Vue.use(Router)

const router = new Router([
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    meta: {
      icon: 'fa-home',
    },
    component: Home,
  },
  {
    path: '*',
    redirect: '/home',
  },
])

export default router
