import React from 'react'
import ReactDOM from 'react-dom'

import {App} from './components/App'
import {routes} from './routes.js'

ReactDOM.render(
  <App routes={routes} />,
  document.getElementById('app')
)
