import Vue from 'vue'
import Vuex from 'vuex'
import { createModule } from 'vuex-toast'

import { tags } from '@shared/models/_data'

import * as actions from './actions'
import * as getters from './getters'
import * as mutations from './mutations'

import {
  configureAppWatchers,
  loadSavedState,
} from './electron'

const state = {
  saves: null,
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
  selectedMod: undefined,
  selectedOnlineMod: undefined,
  selectedSave: undefined,
  onlineQuery: '',
  fetchingOnlineMod: false,
  modals: {
    ModalOnlineModDownload: {
      show: false,
    },
    ModalProfileCreateOrEdit: {
      show: false,
    },
    ModalProfileDelete: {
      show: false,
    },
  },
  appLatestVersion: undefined,

  installedMods: undefined,
  options: undefined,
  paths: undefined,
  profiles: undefined,
  profileSelected: undefined,
  username: undefined,
  onlineMods: undefined,
}

Vue.use(Vuex)

const store = new Vuex.Store({
  actions,
  getters,
  mutations,
  state,
  modules: {
    toast: createModule({ dismissInterval: 8000 }),
  },
  strict: process.env.NODE_ENV !== 'production',
})

loadSavedState(store)
configureAppWatchers(store)

export default store
