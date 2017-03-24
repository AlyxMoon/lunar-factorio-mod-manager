import React from 'react'
import {Nav, Button, ButtonGroup} from 'react-bootstrap'

import {NavItemLink} from './NavItemLink'

export const Header = React.createClass({
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
        <Nav bsStyle='tabs'>
          {this.props.routes.map((route, key) => (
            <NavItemLink key={key} to={route.pathname}>{route.name}</NavItemLink>
          ))}
        </Nav>
      </div>
    )
  }
})
