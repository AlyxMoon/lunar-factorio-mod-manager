import React from 'react'
import ReactDOM from 'react-dom'
import {createStore} from 'redux'
import {Provider} from 'react-redux'

import reducer from './reducer'
import {setRoutes, setActiveTab, setProfiles, setActiveProfile} from './action_creators'

import {routes} from './routes.js'
import {AppContainer} from './components/App'

const store = createStore(reducer)
store.dispatch(setRoutes(routes))
store.dispatch(setActiveTab(routes[0].pathname))

// Placeholder data until app is hooked up fully
const profiles = [
  {
    name: 'Profile1',
    mods: [{ name: 'Mod1', enabled: true }, { name: 'Mod2', enabled: true }]
  },
  {
    name: 'Profile2',
    mods: [{ name: 'Mod3', enabled: false }, { name: 'Mod4', enabled: false }]
  },
  {
    name: 'Profile3',
    mods: [{ name: 'Mod5', enabled: true }, { name: 'Mod6', enabled: false }]
  }
]
const activeProfile = 0
store.dispatch(setProfiles(profiles))
store.dispatch(setActiveProfile(activeProfile))

ReactDOM.render((
  <Provider store={store}>
    <AppContainer />
  </Provider>),
  document.getElementById('app')
)
