import React from 'react'
import {MemoryRouter, Route} from 'react-router-dom'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {connect} from 'react-redux'

import {HeaderContainer} from './Header/Header'
import {FooterContainer} from './Footer/Footer'

require('./style.scss')

export const App = React.createClass({
  mixins: [PureRenderMixin],

  getDefaultProps () {
    return {
      routes: []
    }
  },

  render () {
    return (
      <MemoryRouter>
        <div>
          <HeaderContainer />
          <div className='content'>
            {this.props.routes.map((route, key) => (
              <Route key={key} exact path={route.get('pathname')} component={route.get('component')} />
            ))}
          </div>
          <FooterContainer />
        </div>
      </MemoryRouter>
    )
  }
})

function mapStateToProps (state) {
  return {
    routes: state.get('routes')
  }
}

export const AppContainer = connect(
  mapStateToProps
)(App)
