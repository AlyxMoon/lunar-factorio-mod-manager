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
    ModalEnvironmentCreate: {
      show: false,
    },
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
  environments: undefined,
  profiles: undefined,
  profileSelected: undefined,
  username: undefined,
  onlineMods: undefined,

  pathOptions: [
    {
      text: 'Factorio Data Path',
      variable: 'factorioDataDir',
      hint: 'This is the Factorio data directory. It is used to load the base data used in Factorio which lets the app know which version of Factorio is actively in use. This is needed to correctly manage mod versions.',
    },
    {
      text: 'Factorio Exe Path',
      variable: 'factorioExe',
      hint: 'This is the Factorio executable. It is not required, without it you will be unable to start Factorio through the app.',
    },
    {
      text: 'Mods Folder Path',
      variable: 'modDir',
      hint: 'This is where Factorio looks for mods (and contains the mod-list.json file). Without this the app will be unable to manage mods in any way.',
    },
    {
      text: 'PlayerData File Path',
      variable: 'playerDataFile',
      hint: 'This is where the player-data.json is located, typically with the rest of the Factorio configuration/data files (mods, saves, config, ect.). It is not required. This is used to read the player username and auth token, which is needed to download mods from the online portal.',
    },
    {
      text: 'Saves Folder Path',
      variable: 'saveDir',
      hint: 'This is where the saves folder is. It is not required, without it you will be unable to look at saves in the app and create profiles based on them.',
    },
  ],
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
