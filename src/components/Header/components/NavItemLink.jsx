import React from 'react'
import {Route, Link} from 'react-router-dom'
import createReactClass from 'create-react-class'

export const NavItemLink = createReactClass({
  render () {
    let {to, children, active, onSelect} = this.props
    return (
      <Route path={to} children={() => (
        <li
          role='presentation'
          className={active ? 'active' : ''}
          onClick={() => onSelect(this.props.to)}
        ><Link to={to}>{children}</Link>
        </li>
      )} />
    )
  }
})
