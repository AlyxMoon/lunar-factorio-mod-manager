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

  describe('addLatestAvailableUpdate', () => {
    it('adds release from online mod if later version and compatible', () => {
      const installedMods = fromJS([
        { name: 'Mod1', version: '0.9.0', factorio_version: '0.14' }
      ])
      const onlineMods = fromJS([
        {
          name: 'Mod1',
          releases: [{
            version: '1.0.0',
            factorio_version: '0.14',
            download_url: 'some/url'
          }]
        }
      ])
      const updatedInstalledMods = InstalledMods.addLatestAvailableUpdate(installedMods, onlineMods)
      expect(updatedInstalledMods).to.equal(fromJS([
        {
          name: 'Mod1',
          version: '0.9.0',
          factorio_version: '0.14',
          latestAvailableUpdate: {
            version: '1.0.0',
            factorio_version: '0.14',
            download_url: 'some/url'
          }
        }
      ]))
    })

    it('does not add release if an earlier verion or factorio version is different', () => {
      const installedMods = fromJS([
        { name: 'Mod1', version: '0.9.0', factorio_version: '0.14' },
        { name: 'Mod2', version: '0.9.0', factorio_version: '0.14' }
      ])
      const onlineMods = fromJS([
        {
          name: 'Mod1',
          releases: [{
            version: '0.8.0',
            factorio_version: '0.14',
            download_url: 'some/url'
          }]
        },
        {
          name: 'Mod2',
          releases: [{
            version: '1.0.0',
            factorio_version: '0.15',
            download_url: 'some/url'
          }]
        }
      ])
      const updatedInstalledMods = InstalledMods.addLatestAvailableUpdate(installedMods, onlineMods)
      expect(updatedInstalledMods).to.equal(fromJS([
        { name: 'Mod1', version: '0.9.0', factorio_version: '0.14' },
        { name: 'Mod2', version: '0.9.0', factorio_version: '0.14' }
      ]))
    })

    it('simply returns installedMods if onlineMods is undefined', () => {
      const installedMods = fromJS([{ name: 'Mod1' }])
      const updatedInstalledMods = InstalledMods.addLatestAvailableUpdate(installedMods, undefined)
      expect(updatedInstalledMods).to.equal(fromJS([{ name: 'Mod1' }]))
    })
  })
})
