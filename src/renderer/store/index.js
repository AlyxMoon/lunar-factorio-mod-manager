import Vue from 'vue'
import Vuex from 'vuex'
import { createModule } from 'vuex-toast'

import * as actions from './actions'
import * as getters from './getters'
import * as mutations from './mutations'

const state = {
  activeProfile: undefined,
  editingProfile: false,
  installedMods: [],
  onlineMods: [],
  onlineModCategories: [
    { name: 'all', title: 'All' },
    { name: 'general', title: 'General' },
    { name: 'non-game-changing', title: 'Non-Game-Changing' },
    { name: 'helper-mods', title: 'Helper Mods' },
    { name: 'big-mods', title: 'Big Mods' },
    { name: 'transportation', title: 'Transportation' },
    { name: 'logistics', title: 'Logistics' },
    { name: 'utility', title: 'Utility' },
    { name: 'balancing', title: 'Balancing' },
    { name: 'enemies', title: 'Enemies' },
    { name: 'weapons', title: 'Weapons' },
    { name: 'armor', title: 'Armor' },
    { name: 'oil', title: 'Oil' },
    { name: 'logistics-network', title: 'Logistics Network' },
    { name: 'storage', title: 'Storage' },
    { name: 'power-production', title: 'Power Production' },
    { name: 'manufacture', title: 'Manufacture' },
    { name: 'blueprints', title: 'Blueprints' },
    { name: 'cheats', title: 'Cheats' },
    { name: 'defense', title: 'Defense' },
    { name: 'mining', title: 'Mining' },
    { name: 'info', title: 'Info' },
    { name: 'trains', title: 'Trains' },
  ],
  onlineModSorts: [
    { name: 'a-z', title: 'A to Z' },
    { name: 'popular-most', title: 'Most Popular' },
    { name: 'recent-most', title: 'Most Recent' },
    { name: 'trending-most', title: 'Trending' },
  ],
  onlineModsItemPerPage: 20,
  onlineModsPage: 0,
  onlineModsCurrentFilter: 'all',
  onlineModsCurrentSort: 'popular-most',
  profiles: [],
  selectedMod: undefined,
  selectedOnlineMod: undefined,
  username: '',
  onlineQuery: '',
}

Vue.use(Vuex)

export default new Vuex.Store({
  actions,
  getters,
  mutations,
  state,
  modules: {
    toast: createModule({ dismissInterval: 8000 }),
  },
  strict: process.env.NODE_ENV !== 'production',
})
