import {expect} from 'chai'
import {Map, fromJS} from 'immutable'

import * as OnlineMods from '../../src/onlineMods'

describe('client-side onlineMods', () => {
  describe('setOnlineMods()', () => {
    it('sets the online mods onto the state', () => {
      const onlineMods = fromJS([
        { name: 'Mod1', version: '1.0.0' },
        { name: 'Mod2', version: '1.1.0' }
      ])
      const nextState = OnlineMods.setOnlineMods(Map(), onlineMods)
      expect(nextState).to.equal(fromJS({
        onlineMods: [
          { name: 'Mod1', version: '1.0.0' },
          { name: 'Mod2', version: '1.1.0' }
        ]
      }))
    })

    it('converts to immutable', () => {
      const onlineMods = [
        { name: 'Mod1', version: '1.0.0' },
        { name: 'Mod2', version: '1.1.0' }
      ]
      const nextState = OnlineMods.setOnlineMods(Map(), onlineMods)
      expect(nextState).to.equal(fromJS({
        onlineMods: [
          { name: 'Mod1', version: '1.0.0' },
          { name: 'Mod2', version: '1.1.0' }
        ]
      }))
    })
  })

  describe('setSelectedOnlineMod()', () => {
    it('sets the selected online mod and release onto the state', () => {
      const state = fromJS({
        onlineMods: [
          { name: 'Mod1', releases: [{ version: '1.0.0' }, { version: '1.1.0' }] },
          { name: 'Mod2', releases: [{ version: '1.0.0' }, { version: '1.1.0' }] }
        ]
      })
      const nextState = OnlineMods.setSelectedOnlineMod(state, 1, 0)
      expect(nextState).to.equal(fromJS({
        onlineMods: [
          { name: 'Mod1', releases: [{ version: '1.0.0' }, { version: '1.1.0' }] },
          { name: 'Mod2', releases: [{ version: '1.0.0' }, { version: '1.1.0' }] }
        ],
        selectedOnlineMod: [1, 0]
      }))
    })

    it('sets mod index to last online mod and release to 0 if online mod index out of range', () => {
      const state = fromJS({
        onlineMods: [
          { name: 'Mod1', releases: [{ version: '1.0.0' }, { version: '1.1.0' }] },
          { name: 'Mod2', releases: [{ version: '1.0.0' }, { version: '1.1.0' }] }
        ]
      })
      const nextState = OnlineMods.setSelectedOnlineMod(state, 2, 1)
      expect(nextState).to.equal(fromJS({
        onlineMods: [
          { name: 'Mod1', releases: [{ version: '1.0.0' }, { version: '1.1.0' }] },
          { name: 'Mod2', releases: [{ version: '1.0.0' }, { version: '1.1.0' }] }
        ],
        selectedOnlineMod: [1, 0]
      }))
    })

    it('sets release to 0 if out of range for that mod', () => {
      const state = fromJS({
        onlineMods: [
          { name: 'Mod1', releases: [{ version: '1.0.0' }, { version: '1.1.0' }] },
          { name: 'Mod2', releases: [{ version: '1.0.0' }] }
        ]
      })
      const nextState = OnlineMods.setSelectedOnlineMod(state, 1, 1)
      expect(nextState).to.equal(fromJS({
        onlineMods: [
          { name: 'Mod1', releases: [{ version: '1.0.0' }, { version: '1.1.0' }] },
          { name: 'Mod2', releases: [{ version: '1.0.0' }] }
        ],
        selectedOnlineMod: [1, 0]
      }))
    })
  })

  describe('setOnlineModFilter()', () => {
    it('sets the filter onto the state', () => {
      const nextState = OnlineMods.setOnlineModFilter(Map(), 'all')
      expect(nextState).to.equal(fromJS({
        onlineModFilter: 'all'
      }))
    })
  })

  describe('setOnlineModSort()', () => {
    it('sets the sort option onto the state', () => {
      const nextState = OnlineMods.setOnlineModSort(Map(), 'downloads', 'ascending')
      expect(nextState).to.equal(fromJS({
        onlineModSort: ['downloads', 'ascending']
      }))
    })
  })
})
