import React from 'react'
import ReactDOM from 'react-dom'
import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'

import reducer from './reducer'
import {
  setRoutes,
  setActiveTab,
  setOnlineModSort
} from './action_creators'

import {routes} from './routes.js'
import {AppContainer} from './components/App'
import openLinkMiddleware from './openLinkMiddleware'
import sendToMainMiddleware from './sendToMainMiddleware'

import listenToMainProcessMessages from './listenToMainProcessMessages'

const createStoreWithMiddleware = applyMiddleware(
  openLinkMiddleware,
  sendToMainMiddleware
)(createStore)
const store = createStoreWithMiddleware(reducer)

store.dispatch(setRoutes(routes))
store.dispatch(setActiveTab(routes[0].pathname))
store.dispatch(setOnlineModSort('name', 'ascending'))
listenToMainProcessMessages(store)

ReactDOM.render((
  <Provider store={store}>
    <AppContainer />
  </Provider>),
  document.getElementById('app')
)
