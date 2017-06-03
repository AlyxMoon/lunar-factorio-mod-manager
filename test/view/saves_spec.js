/* eslint-disable no-unused-expressions */

import {expect} from 'chai'
import {Map, fromJS} from 'immutable'

import * as Saves from '../../src/saves'

describe('client-side saves', () => {
  describe('setSaves()', () => {
    it('sets the saves on the state', () => {
      const saves = fromJS([
        { 'name': 'Save1', 'mods': ['Mod1'] },
        { 'name': 'Save2', 'mods': ['Mod2'] }
      ])
      const nextState = Saves.setSaves(Map(), saves)
      expect(nextState).to.equal(fromJS({
        saves: [
          { 'name': 'Save1', 'mods': ['Mod1'] },
          { 'name': 'Save2', 'mods': ['Mod2'] }
        ]
      }))
    })

    it('converts to immutable', () => {
      const saves = [
        { 'name': 'Save1', 'mods': ['Mod1'] },
        { 'name': 'Save2', 'mods': ['Mod2'] }
      ]
      const nextState = Saves.setSaves(Map(), saves)
      expect(nextState).to.equal(fromJS({
        saves: [
          { 'name': 'Save1', 'mods': ['Mod1'] },
          { 'name': 'Save2', 'mods': ['Mod2'] }
        ]
      }))
    })
  })
})
