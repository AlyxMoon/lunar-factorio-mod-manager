/* eslint-disable no-unused-expressions */

import {expect} from 'chai'
import {Map, fromJS} from 'immutable'

import * as Settings from '../../src/settings'

describe('Client-side settings', () => {
  describe('setAppSettings()', () => {
    it('sets the settings on the state', () => {
      const state = fromJS({
        settings: {}
      })
      const nextState = Settings.setAppSettings(state, Map({someOption: 42}))
      expect(nextState).to.equal(fromJS({
        settings: {
          someOption: 42
        }
      }))
    })

    it('converts to immutable', () => {
      const state = fromJS({
        settings: {}
      })
      const nextState = Settings.setAppSettings(state, {someOption: 42})
      expect(nextState).to.equal(fromJS({
        settings: {
          someOption: 42
        }
      }))
    })
  })

  describe('changeAppSetting()', () => {
    it('changes the given setting on the state', () => {
      const state = fromJS({
        settings: {
          someOption: 12
        }
      })
      const nextState = Settings.changeAppSetting(state, 'someOption', 42)
      expect(nextState).to.equal(fromJS({
        settings: {
          someOption: 42
        }
      }))
    })

    it('creates the key in the settings if it does not exist', () => {
      const state = fromJS({
        settings: {}
      })
      const nextState = Settings.changeAppSetting(state, 'someOption', 42)
      expect(nextState).to.equal(fromJS({
        settings: {
          someOption: 42
        }
      }))
    })
  })
})
