import React from 'react'
import ReactDOM from 'react-dom'
import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'

import reducer from './reducer'
import {
  setRoutes,
  setActiveTab,
  setProfiles,
  setActiveProfile,
  setInstalledMods,
  setSelectedInstalledMod,
  setAppCurrentVersion,
  setAppLatestVersion,
  setPlayerName
} from './action_creators'

import {routes} from './routes.js'
import {AppContainer} from './components/App'
import openLinkMiddleware from './openLinkMiddleware'

const createStoreWithMiddleware = applyMiddleware(
    openLinkMiddleware
)(createStore)
const store = createStoreWithMiddleware(reducer)

store.dispatch(setRoutes(routes))
store.dispatch(setActiveTab(routes[0].pathname))

// Placeholder data until app is hooked up fully
const activeProfile = 0
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

const selectedInstalledMod = 0
const installedMods = [
  {
    name: 'Mod1',
    version: '1.0.0',
    factorio_version: '0.14',
    author: 'Placeholder author',
    contact: 'somecontact@email.com',
    homepage: 'www.definitelyarealhomepage.com',
    dependencies: ['base >= 0.14.0', 'Mod2'],
    description: 'This mod does stuff'
  },
  {
    name: 'Mod2',
    version: '0.9.0',
    dependencies: 'Just one dependency'
  }
]

store.dispatch(setProfiles(profiles))
store.dispatch(setActiveProfile(activeProfile))

store.dispatch(setInstalledMods(installedMods))
store.dispatch(setSelectedInstalledMod(selectedInstalledMod))

store.dispatch(setAppCurrentVersion('1.0.0'))
store.dispatch(setAppLatestVersion('2.0.0'))

store.dispatch(setPlayerName('Alyx DeLunar'))

ReactDOM.render((
  <Provider store={store}>
    <AppContainer />
  </Provider>),
  document.getElementById('app')
)
