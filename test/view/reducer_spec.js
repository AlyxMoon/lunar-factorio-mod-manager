import {expect} from 'chai'
import {fromJS} from 'immutable'

import reducer from '../../src/reducer'

describe('reducer', () => {
  it('has an initial state', () => {
    const routes = [{name: 'Profiles', pathname: '/'}]
    const action = {type: 'SET_ROUTES', routes: routes}
    const nextState = reducer(undefined, action)
    expect(nextState).to.equal(fromJS({
      routes: [{name: 'Profiles', pathname: '/'}]
    }))
  })

  it('handles SET_ROUTES', () => {
    const fullRoutes = [{name: 'Profiles', pathname: '/'}, {name: 'About', pathname: '/about'}]
    const state = fromJS({
      routes: [{name: 'Profiles', pathname: '/'}]
    })
    const action = {type: 'SET_ROUTES', routes: fullRoutes}
    const nextState = reducer(state, action)
    expect(nextState).to.equal(fromJS({
      routes: [{name: 'Profiles', pathname: '/'}, {name: 'About', pathname: '/about'}]
    }))
  })

  it('handles SET_ACTIVE_TAB', () => {
    const state = fromJS({activeTab: 'profiles'})
    const action = {type: 'SET_ACTIVE_TAB', tab: 'installedMods'}
    const nextState = reducer(state, action)
    expect(nextState).to.equal(fromJS({
      activeTab: 'installedMods'
    }))
  })
})
