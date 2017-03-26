import {expect} from 'chai'
import {Map, fromJS} from 'immutable'

import reducer from '../../src/reducer'
import * as actionCreators from '../../src/action_creators'

describe('client-side reducer', () => {
  it('has an initial state', () => {
    const routes = [{name: 'Profiles', pathname: '/'}]
    const nextState = reducer(undefined, actionCreators.setRoutes(routes))
    expect(nextState).to.equal(fromJS({
      routes: [{name: 'Profiles', pathname: '/'}]
    }))
  })

  it('handles SET_ROUTES', () => {
    const fullRoutes = [{name: 'Profiles', pathname: '/'}, {name: 'About', pathname: '/about'}]
    const state = fromJS({
      routes: [{name: 'Profiles', pathname: '/'}]
    })
    const nextState = reducer(state, actionCreators.setRoutes(fullRoutes))
    expect(nextState).to.equal(fromJS({
      routes: [{name: 'Profiles', pathname: '/'}, {name: 'About', pathname: '/about'}]
    }))
  })

  it('handles SET_ACTIVE_TAB', () => {
    const state = fromJS({activeTab: 'profiles'})
    const nextState = reducer(state, actionCreators.setActiveTab('installedMods'))
    expect(nextState).to.equal(fromJS({
      activeTab: 'installedMods'
    }))
  })

  it('handles SET_PROFILES', () => {
    const profiles = [
      { name: 'Profile1' },
      { name: 'Profile2' }
    ]
    const nextState = reducer(Map(), actionCreators.setProfiles(profiles))
    expect(nextState).to.equal(fromJS({
      profiles: [{ name: 'Profile1' }, { name: 'Profile2' }]
    }))
  })

  it('handles SET_ACTIVE_PROFILE', () => {
    const state = fromJS({
      profiles: [{ name: 'Profile1' }]
    })
    const nextState = reducer(state, actionCreators.setActiveProfile(0))
    expect(nextState).to.equal(fromJS({
      profiles: [{ name: 'Profile1' }],
      activeProfile: 0
    }))
  })

  it('handles ADD_PROFILE', () => {
    const state = fromJS({
      profiles: [{ name: 'Profile1' }]
    })
    const nextState = reducer(state, actionCreators.addProfile())
    expect(nextState).to.equal(fromJS({
      profiles: [{ name: 'Profile1' }, { name: 'New Profile' }]
    }))
  })

  it('handles RENAME_PROFILE', () => {
    const state = fromJS({
      profiles: [{ name: 'Profile1' }, { name: 'Profile2' }]
    })
    const nextState = reducer(state, actionCreators.renameProfile(0, 'Awesome Profile'))
    expect(nextState).to.equal(fromJS({
      profiles: [{ name: 'Awesome Profile' }, { name: 'Profile2' }]
    }))
  })

  it('handles DELETE_PROFILE', () => {
    const state = fromJS({
      profiles: [{ name: 'Profile1' }, { name: 'Profile2' }]
    })
    const nextState = reducer(state, actionCreators.deleteProfile(0))
    expect(nextState).to.equal(fromJS({
      profiles: [{ name: 'Profile2' }]
    }))
  })

  it('handles MOVE_PROFILE_UP', () => {
    const state = fromJS({
      profiles: [{ name: 'Profile1' }, { name: 'Profile2' }, { name: 'Profile3' }],
      activeProfile: 1
    })
    const nextState = reducer(state, actionCreators.moveProfileUp(1))
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
    const nextState = reducer(state, actionCreators.moveProfileDown(1))
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
    const nextState = reducer(state, actionCreators.toggleModStatus(0, 0))
    expect(nextState).to.equal(fromJS({
      profiles: [{
        name: 'Profile1',
        mods: [{ name: 'Mod1', enabled: false }]
      }]
    }))
  })

  it('handles SET_INSTALLED_MODS', () => {
    const mods = fromJS([
      { name: 'Mod1' }, { name: 'Mod2' }
    ])
    const nextState = reducer(Map(), actionCreators.setInstalledMods(mods))
    expect(nextState).to.equal(fromJS({
      installedMods: [{ name: 'Mod1' }, { name: 'Mod2' }]
    }))
  })

  it('handles SET_SELECTED_INSTALLED_MOD', () => {
    const state = fromJS({
      installedMods: [{ name: 'Mod1' }, { name: 'Mod2' }]
    })
    const nextState = reducer(state, actionCreators.setSelectedInstalledMod(0))
    expect(nextState).to.equal(fromJS({
      installedMods: [{ name: 'Mod1' }, { name: 'Mod2' }],
      selectedInstalledMod: 0
    }))
  })

  it('handles DELETE_INSTALLED_MOD', () => {
    const state = fromJS({
      installedMods: [{ name: 'Mod1' }, { name: 'Mod2' }]
    })
    const nextState = reducer(state, actionCreators.deleteInstalledMod(0))
    expect(nextState).to.equal(fromJS({
      installedMods: [{ name: 'Mod2' }]
    }))
  })
})
