import Vue from 'vue'
import Vuex from 'vuex'

import * as actions from './actions'
import * as getters from './getters'
import * as mutations from './mutations'

const state = {
  activeProfile: undefined,
  profiles: [],
}

Vue.use(Vuex)

export default new Vuex.Store({
  actions,
  getters,
  mutations,
  state,
  strict: process.env.NODE_ENV !== 'production',
})
