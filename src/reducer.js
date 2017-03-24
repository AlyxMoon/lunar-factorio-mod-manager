import {Map, fromJS} from 'immutable'

function setRoutes (state, routes) {
  return state.set('routes', fromJS(routes))
}

function setActiveTab (state, tab) {
  return state.set('activeTab', tab)
}

export default function reducer (state = Map(), action) {
  switch (action.type) {
    case 'SET_ROUTES':
      return setRoutes(state, action.routes)
    case 'SET_ACTIVE_TAB':
      return setActiveTab(state, action.tab)
  }
  return state
}
