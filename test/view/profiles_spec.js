/* eslint-disable no-unused-expressions */

import {expect} from 'chai'
import {Map, fromJS} from 'immutable'

import * as Profiles from '../../src/profiles'

describe('client-side profiles', () => {
  describe('setRoutes()', () => {
    it('sets the routes on the state', () => {
      const state = fromJS({
        routes: []
      })
      const routes = fromJS([
        { name: 'route1', pathname: '/route1' },
        { name: 'route2', pathname: '/route2' }
      ])
      const nextState = Profiles.setRoutes(state, routes)
      expect(nextState).to.equal(fromJS({
        routes: [
          { name: 'route1', pathname: '/route1' },
          { name: 'route2', pathname: '/route2' }
        ]
      }))
    })

    it('converts to immutable', () => {
      const state = fromJS({
        routes: []
      })
      const routes = [
        { name: 'route1', pathname: '/route1' },
        { name: 'route2', pathname: '/route2' }
      ]
      const nextState = Profiles.setRoutes(state, routes)
      expect(nextState).to.equal(fromJS({
        routes: [
          { name: 'route1', pathname: '/route1' },
          { name: 'route2', pathname: '/route2' }
        ]
      }))
    })
  })

  describe('setActiveTab()', () => {
    it('sets the active tab on the state', () => {
      const nextState = Profiles.setActiveTab(Map(), 0)
      expect(nextState).to.equal(Map({ activeTab: 0 }))
    })
  })

  describe('setProfiles()', () => {
    it('sets the profiles on the state', () => {
      const profiles = fromJS([
        { name: 'Profile1' }, { name: 'Profile2' }
      ])
      const nextState = Profiles.setProfiles(Map(), profiles)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }]
      }))
    })

    it('converts to immutable', () => {
      const profiles = [{ name: 'Profile1' }, { name: 'Profile2' }]
      const nextState = Profiles.setProfiles(Map(), profiles)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }]
      }))
    })
  })

  describe('setActiveProfile()', () => {
    it('sets the active profile on the state', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }]
      })
      const nextState = Profiles.setActiveProfile(state, 1)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }],
        activeProfile: 1
      }))
    })

    it('sets active profile to last profile if it is above the range', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }]
      })
      const nextState = Profiles.setActiveProfile(state, 2)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }],
        activeProfile: 1
      }))
    })

    it('will not set active profile less than 0', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }]
      })
      const nextState = Profiles.setActiveProfile(state, -1)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }],
        activeProfile: 0
      }))
    })

    it('sets active profile to 0 if there are no profiles', () => {
      const nextState = Profiles.setActiveProfile(Map(), 1)
      expect(nextState).to.equal(fromJS({
        activeProfile: 0
      }))
    })
  })

  describe('addProfile()', () => {
    it('adds a profile onto the state with the provided name', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }]
      })
      const nextState = Profiles.addProfile(state, 'Some Cool Profile')
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Some Cool Profile' }]
      }))
    })

    it('adds a profile onto the state when no name is provided', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }]
      })
      const nextState = Profiles.addProfile(state)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'New Profile' }]
      }))
    })
  })

  describe('renameProfile()', () => {
    it('changes the name of the profile at the given index', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }]
      })
      const nextState = Profiles.renameProfile(state, 0, 'Awesome Profile')
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Awesome Profile' }, { name: 'Profile2' }]
      }))
    })

    it('does nothing if index out of range', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }]
      })
      const nextState1 = Profiles.renameProfile(state, 2, 'Awesome Profile')
      const nextState2 = Profiles.renameProfile(state, -4, 'Awesome Profile')

      expect(nextState1).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }]
      }))
      expect(nextState2).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }]
      }))
    })
  })

  describe('deleteProfile()', () => {
    it('deletes the profile at the provided index', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }],
        activeProfile: 0
      })
      const nextState = Profiles.deleteProfile(state, 1)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }],
        activeProfile: 0
      }))
    })

    it('does nothing when index is out of range', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }],
        activeProfile: 0
      })
      const nextState1 = Profiles.deleteProfile(state, 1)
      const nextState2 = Profiles.deleteProfile(state, -2)

      expect(nextState1).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }],
        activeProfile: 0
      }))
      expect(nextState2).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }],
        activeProfile: 0
      }))
    })

    it('changes the active profile if that was deleted', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }],
        activeProfile: 1
      })
      const nextState = Profiles.deleteProfile(state, 1)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }],
        activeProfile: 0
      }))
    })
  })

  describe('moveProfileUp()', () => {
    it('shifts the profile at the given index up by one', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }, { name: 'Profile3' }],
        activeProfile: 0
      })
      const nextState = Profiles.moveProfileUp(state, 2)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile3' }, { name: 'Profile2' }],
        activeProfile: 0
      }))
    })

    it('changes the activeProfile if that has been shifted', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }, { name: 'Profile3' }],
        activeProfile: 1
      })
      const nextState = Profiles.moveProfileUp(state, 2)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile3' }, { name: 'Profile2' }],
        activeProfile: 2
      }))
    })

    it('changes the activeProfile if that is same as index', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }, { name: 'Profile3' }],
        activeProfile: 2
      })
      const nextState = Profiles.moveProfileUp(state, 2)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile3' }, { name: 'Profile2' }],
        activeProfile: 1
      }))
    })

    it('does nothing with one profile', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }],
        activeProfile: 0
      })
      const nextState = Profiles.moveProfileUp(state, 1)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }],
        activeProfile: 0
      }))
    })

    it('does nothing with no profiles', () => {
      const state = fromJS({
        profiles: [],
        activeProfile: 0
      })
      const nextState = Profiles.moveProfileUp(state, 0)
      expect(nextState).to.equal(fromJS({
        profiles: [],
        activeProfile: 0
      }))
    })

    it('does nothing if index out of bounds', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }],
        activeProfile: 0
      })
      const nextState = Profiles.moveProfileUp(state, 2)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }],
        activeProfile: 0
      }))
    })
  })

  describe('moveProfileDown()', () => {
    it('shifts the profile at the given index up by one', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }, { name: 'Profile3' }],
        activeProfile: 0
      })
      const nextState = Profiles.moveProfileDown(state, 1)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile3' }, { name: 'Profile2' }],
        activeProfile: 0
      }))
    })

    it('changes the activeProfile if that has been shifted', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }, { name: 'Profile3' }],
        activeProfile: 2
      })
      const nextState = Profiles.moveProfileDown(state, 1)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile3' }, { name: 'Profile2' }],
        activeProfile: 1
      }))
    })

    it('changes the activeProfile if that is same as index', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }, { name: 'Profile3' }],
        activeProfile: 1
      })
      const nextState = Profiles.moveProfileDown(state, 1)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile3' }, { name: 'Profile2' }],
        activeProfile: 2
      }))
    })

    it('does nothing with one profile', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }],
        activeProfile: 0
      })
      const nextState = Profiles.moveProfileDown(state, 1)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }],
        activeProfile: 0
      }))
    })

    it('does nothing with no profiles', () => {
      const state = fromJS({
        profiles: [],
        activeProfile: 0
      })
      const nextState = Profiles.moveProfileDown(state, 0)
      expect(nextState).to.equal(fromJS({
        profiles: [],
        activeProfile: 0
      }))
    })

    it('does nothing if index out of bounds', () => {
      const state = fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }],
        activeProfile: 0
      })
      const nextState = Profiles.moveProfileDown(state, 2)
      expect(nextState).to.equal(fromJS({
        profiles: [{ name: 'Profile1' }, { name: 'Profile2' }],
        activeProfile: 0
      }))
    })
  })

  describe('toggleModStatus()', () => {
    it('toggles the enabled property of the mod at the given index', () => {
      const state = fromJS({
        profiles: [{
          name: 'Profile1',
          mods: [{ name: 'Mod1', enabled: true }]
        }]
      })
      const nextState = Profiles.toggleModStatus(state, 0, 0)
      expect(nextState).to.equal(fromJS({
        profiles: [{
          name: 'Profile1',
          mods: [{ name: 'Mod1', enabled: false }]
        }]
      }))
    })

    it('does nothing if profileIndex is out of range', () => {
      const state = fromJS({
        profiles: [{
          name: 'Profile1',
          mods: [{ name: 'Mod1', enabled: true }]
        }]
      })
      const nextState = Profiles.toggleModStatus(state, 1, 0)
      expect(nextState).to.equal(fromJS({
        profiles: [{
          name: 'Profile1',
          mods: [{ name: 'Mod1', enabled: true }]
        }]
      }))
    })

    it('does nothing if modIndex is out of range', () => {
      const state = fromJS({
        profiles: [{
          name: 'Profile1',
          mods: [{ name: 'Mod1', enabled: true }]
        }]
      })
      const nextState = Profiles.toggleModStatus(state, 0, 1)
      expect(nextState).to.equal(fromJS({
        profiles: [{
          name: 'Profile1',
          mods: [{ name: 'Mod1', enabled: true }]
        }]
      }))
    })
  })
})
