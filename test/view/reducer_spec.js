/* eslint-disable no-unused-expressions */

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

  it('handles SET_APP_CURRENT_VERSION', () => {
    const nextState = reducer(Map(), actionCreators.setAppCurrentVersion('1.0.0'))
    expect(nextState).to.equal(fromJS({
      appCurrentVersion: '1.0.0'
    }))
  })

  it('handles SET_APP_LATEST_VERSION', () => {
    const nextState = reducer(Map(), actionCreators.setAppLatestVersion('1.0.0'))
    expect(nextState).to.equal(fromJS({
      appLatestVersion: '1.0.0'
    }))
  })

  it('handles SET_PLAYER_NAME', () => {
    const nextState = reducer(Map(), actionCreators.setPlayerName('Alyx'))
    expect(nextState).to.equal(fromJS({
      playerName: 'Alyx'
    }))
  })

  it('handles SET_ONLINE_MODS_FETCHED_COUNT', () => {
    const nextState = reducer(Map(), actionCreators.setOnlineModsFetchedCount(5))
    expect(nextState).to.equal(fromJS({
      onlineModsFetchedCount: 5
    }))
  })

  it('handles SET_ONLINE_MODS_COUNT', () => {
    const nextState = reducer(Map(), actionCreators.setOnlineModsCount(5))
    expect(nextState).to.equal(fromJS({
      onlineModsCount: 5
    }))
  })

  it('handles SET_FACTORIO_VERSION', () => {
    const nextState = reducer(Map(), actionCreators.setFactorioVersion('0.14.0'))
    expect(nextState).to.equal(fromJS({
      factorioVersion: '0.14.0'
    }))
  })

  it('handles SET_ONLINE_MODS', () => {
    const onlineMods = fromJS([
      { name: 'Mod1', version: '1.0.0' },
      { name: 'Mod2', version: '1.1.0' }
    ])
    const nextState = reducer(Map(), actionCreators.setOnlineMods(onlineMods))
    expect(nextState).to.equal(fromJS({
      onlineMods: [
        { name: 'Mod1', version: '1.0.0' },
        { name: 'Mod2', version: '1.1.0' }
      ]
    }))
  })

  it('handles SET_SELECTED_ONLINE_MOD', () => {
    const state = fromJS({
      onlineMods: [
        { name: 'Mod1', releases: [{ version: '1.0.0' }] }
      ]
    })
    const nextState = reducer(state, actionCreators.setSelectedOnlineMod(0, 0))
    expect(nextState).to.equal(fromJS({
      onlineMods: [
        { name: 'Mod1', releases: [{ version: '1.0.0' }] }
      ],
      selectedOnlineMod: [0, 0]
    }))
  })

  it('handles SET_ONLINE_MOD_FILTER', () => {
    const nextState = reducer(Map(), actionCreators.setOnlineModFilter('installStatus', 'all'))
    expect(nextState).to.equal(fromJS({
      onlineModFilters: { installStatus: 'all' }
    }))
  })

  it('handles SET_ONLINE_MOD_SORT', () => {
    const nextState = reducer(Map(), actionCreators.setOnlineModSort('downloads', 'ascending'))
    expect(nextState).to.equal(fromJS({
      onlineModSort: ['downloads', 'ascending']
    }))
  })
})
