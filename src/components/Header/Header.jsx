import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {connect} from 'react-redux'
import {Nav, Button, ButtonGroup} from 'react-bootstrap'

import * as actionCreators from '../../action_creators'
import {NavItemLink} from './components/NavItemLink'

require('./style.scss')

export const Header = React.createClass({
  mixins: [PureRenderMixin],

  getDefaultProps () {
    return {
      startFactorio: () => {},
      routes: []
    }
  },

  render () {
    return (
      <div className='header'>
        <ButtonGroup>
          <Button bsStyle='success' className='startFactorio' onClick={this.props.startFactorio}>Start Factorio</Button>
        </ButtonGroup>
        <Nav bsStyle='tabs' onSelect={this.props.setActiveTab}>
          {this.props.routes.map((route, key) => (
            <NavItemLink
              key={key}
              to={route.get('pathname')}
              active={this.props.activeTab === route.get('pathname')}
            >{route.get('name')}
            </NavItemLink>
          ))}
        </Nav>
      </div>
    )
  }
})

function mapStateToProps (state) {
  return {
    routes: state.get('routes'),
    activeTab: state.get('activeTab')
  }
}

export const HeaderContainer = connect(
  mapStateToProps,
  actionCreators
)(Header)
