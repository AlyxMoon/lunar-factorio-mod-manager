import Vue from 'vue'
import Vuex from 'vuex'
import { createModule } from 'vuex-toast'

import { tags } from '@shared/models/_data'

import * as actions from './actions'
import * as getters from './getters'
import * as mutations from './mutations'

const state = {
  activeProfile: undefined,
  installedMods: [],
  onlineMods: [],
  onlineModCategories: tags.map(tag => ({
    name: tag,
    title: tag
      .replace(/-/g, ' ')
      .replace(/(?:^|\s)\S/g, c => c.toUpperCase()),
  })),
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
  modals: {
    ModalProfileCreateOrEdit: false,
    ModalProfileDelete: false,
  },
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
