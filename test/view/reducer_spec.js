import {expect} from 'chai'
import {Map, fromJS} from 'immutable'

import reducer from '../../src/reducer'

describe('client-side reducer', () => {
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

  it('handles SET_PROFILES', () => {
    const profiles = [
      { name: 'Profile1' },
      { name: 'Profile2' }
    ]
    const action = {type: 'SET_PROFILES', profiles: profiles}
    const nextState = reducer(Map(), action)
    expect(nextState).to.equal(fromJS({
      profiles: [{ name: 'Profile1' }, { name: 'Profile2' }]
    }))
  })

  it('handles SET_ACTIVE_PROFILE', () => {
    const state = fromJS({
      profiles: [{ name: 'Profile1' }]
    })
    const action = {type: 'SET_ACTIVE_PROFILE', activeProfile: 0}
    const nextState = reducer(state, action)
    expect(nextState).to.equal(fromJS({
      profiles: [{ name: 'Profile1' }],
      activeProfile: 0
    }))
  })

  it('handles ADD_PROFILE', () => {
    const state = fromJS({
      profiles: [{ name: 'Profile1' }]
    })
    const action = {type: 'ADD_PROFILE'}
    const nextState = reducer(state, action)
    expect(nextState).to.equal(fromJS({
      profiles: [{ name: 'Profile1' }, { name: 'New Profile' }]
    }))
  })

  it('handles RENAME_PROFILE', () => {
    const state = fromJS({
      profiles: [{ name: 'Profile1' }, { name: 'Profile2' }]
    })
    const action = {type: 'RENAME_PROFILE', index: 0, name: 'Awesome Profile'}
    const nextState = reducer(state, action)
    expect(nextState).to.equal(fromJS({
      profiles: [{ name: 'Awesome Profile' }, { name: 'Profile2' }]
    }))
  })

  it('handles DELETE_PROFILE', () => {
    const state = fromJS({
      profiles: [{ name: 'Profile1' }, { name: 'Profile2' }]
    })
    const action = {type: 'DELETE_PROFILE', index: 0}
    const nextState = reducer(state, action)
    expect(nextState).to.equal(fromJS({
      profiles: [{ name: 'Profile2' }]
    }))
  })

  it('handles MOVE_PROFILE_UP', () => {
    const state = fromJS({
      profiles: [{ name: 'Profile1' }, { name: 'Profile2' }, { name: 'Profile3' }],
      activeProfile: 1
    })
    const action = {type: 'MOVE_PROFILE_UP', index: 1}
    const nextState = reducer(state, action)
    expect(nextState).to.equal(fromJS({
      profiles: [{ name: 'Profile2' }, { name: 'Profile1' }, { name: 'Profile3' }],
      activeProfile: 0
    }))
  })

  it('handles MOVE_PROFILE_DOWN', () => {
    const state = fromJS({
      profiles: [{ name: 'Profile1' }, { name: 'Profile2' }, { name: 'Profile3' }],
      activeProfile: 1
    })
    const action = {type: 'MOVE_PROFILE_DOWN', index: 1}
    const nextState = reducer(state, action)
    expect(nextState).to.equal(fromJS({
      profiles: [{ name: 'Profile1' }, { name: 'Profile3' }, { name: 'Profile2' }],
      activeProfile: 2
    }))
  })

  it('handles TOGGLE_MOD_STATUS', () => {
    const state = fromJS({
      profiles: [{
        name: 'Profile1',
        mods: [{ name: 'Mod1', enabled: true }]
      }]
    })
    const action = {type: 'TOGGLE_MOD_STATUS', profileIndex: 0, modIndex: 0}
    const nextState = reducer(state, action)
    expect(nextState).to.equal(fromJS({
      profiles: [{
        name: 'Profile1',
        mods: [{ name: 'Mod1', enabled: false }]
      }]
    }))
  })
})
