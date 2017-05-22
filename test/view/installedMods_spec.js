import {expect} from 'chai'
import {Map, fromJS} from 'immutable'

import * as InstalledMods from '../../src/installedMods'

describe('clients-side installedMods', () => {
  describe('setInstalledMods()', () => {
    it('sets the installed mods onto the state', () => {
      const installedMods = fromJS([
        { name: 'Mod1', version: '1.0.0' },
        { name: 'Mod2', version: '1.1.0' }
      ])
      const nextState = InstalledMods.setInstalledMods(Map(), installedMods)
      expect(nextState).to.equal(fromJS({
        installedMods: [
          { name: 'Mod1', version: '1.0.0' },
          { name: 'Mod2', version: '1.1.0' }
        ]
      }))
    })

    it('converts to immutable', () => {
      const installedMods = [
        { name: 'Mod1', version: '1.0.0' },
        { name: 'Mod2', version: '1.1.0' }
      ]
      const nextState = InstalledMods.setInstalledMods(Map(), installedMods)
      expect(nextState).to.equal(fromJS({
        installedMods: [
          { name: 'Mod1', version: '1.0.0' },
          { name: 'Mod2', version: '1.1.0' }
        ]
      }))
    })
  })

  describe('setSelectedInstalledMod()', () => {
    it('sets the value onto the state', () => {
      const state = fromJS({
        installedMods: [
          { name: 'Mod1', version: '1.0.0' },
          { name: 'Mod2', version: '1.1.0' }
        ]
      })
      const nextState = InstalledMods.setSelectedInstalledMod(state, 0)
      expect(nextState).to.equal(fromJS({
        installedMods: [
          { name: 'Mod1', version: '1.0.0' },
          { name: 'Mod2', version: '1.1.0' }
        ],
        selectedInstalledMod: 0
      }))
    })

    it('sets the value to the last installedMod if above bounds', () => {
      const state = fromJS({
        installedMods: [
          { name: 'Mod1', version: '1.0.0' },
          { name: 'Mod2', version: '1.1.0' }
        ]
      })
      const nextState = InstalledMods.setSelectedInstalledMod(state, 2)
      expect(nextState).to.equal(fromJS({
        installedMods: [
          { name: 'Mod1', version: '1.0.0' },
          { name: 'Mod2', version: '1.1.0' }
        ],
        selectedInstalledMod: 1
      }))
    })

    it('does not set value lower than 0', () => {
      const state = fromJS({
        installedMods: [
          { name: 'Mod1', version: '1.0.0' },
          { name: 'Mod2', version: '1.1.0' }
        ]
      })
      const nextState = InstalledMods.setSelectedInstalledMod(state, -1)
      expect(nextState).to.equal(fromJS({
        installedMods: [
          { name: 'Mod1', version: '1.0.0' },
          { name: 'Mod2', version: '1.1.0' }
        ],
        selectedInstalledMod: 0
      }))
    })
  })

  describe('deleteInstalledMod()', () => {
    it('deletes the mod at the given index', () => {
      const state = fromJS({
        installedMods: [{ name: 'Mod1' }, { name: 'Mod2' }]
      })
      const nextState = InstalledMods.deleteInstalledMod(state, 0)
      expect(nextState).to.equal(fromJS({
        installedMods: [{ name: 'Mod2' }]
      }))
    })

    it('does nothing if index out of range', () => {
      const state = fromJS({
        installedMods: [{ name: 'Mod1' }, { name: 'Mod2' }]
      })
      const nextState = InstalledMods.deleteInstalledMod(state, 2)
      expect(nextState).to.equal(fromJS({
        installedMods: [{ name: 'Mod1' }, { name: 'Mod2' }]
      }))
    })
  })
})
