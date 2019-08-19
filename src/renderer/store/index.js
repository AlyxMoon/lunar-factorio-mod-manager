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
  profiles: [],
  selectedMod: undefined,
  username: '',
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
