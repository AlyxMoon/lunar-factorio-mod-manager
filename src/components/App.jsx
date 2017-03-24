import React from 'react'
import {MemoryRouter, Route} from 'react-router-dom'

import {Header} from './Header'

export const App = React.createClass({
  propTypes: {
    routes: React.PropTypes.array.isRequired
  },

  getInitialState () {
    return {
      routes: this.props.routes
    }
  },

  render () {
    return (
      <MemoryRouter>
        <div>
          <Header routes={this.state.routes} />

          {this.state.routes.map((route, key) => (
            <Route key={key} exact path={route.pathname} component={route.component} />
          ))}
        </div>
      </MemoryRouter>
    )
  }
})
