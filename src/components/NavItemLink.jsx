import React from 'react'
import {Route, Link} from 'react-router-dom'

export const NavItemLink = ({to, children}) => (
  <Route path={to} children={({match}) => (
    <li role='presentation' className={match && match.isExact ? 'active' : ''}>
      <Link to={to}>{children}</Link>
    </li>
  )} />
)
