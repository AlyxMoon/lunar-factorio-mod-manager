import React from 'react'
import ReactDOM from 'react-dom'
import {createStore} from 'redux'
import {Provider} from 'react-redux'

import reducer from './reducer'
import {setRoutes, setActiveTab} from './action_creators'

import {routes} from './routes.js'
import {AppContainer} from './components/App'

const store = createStore(reducer)
store.dispatch(setRoutes(routes))
store.dispatch(setActiveTab(routes[0].pathname))

ReactDOM.render((
  <Provider store={store}>
    <AppContainer />
  </Provider>),
  document.getElementById('app')
)
