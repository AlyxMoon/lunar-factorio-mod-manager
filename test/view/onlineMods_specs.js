import {expect} from 'chai'
import {List, Map, fromJS} from 'immutable'

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
    it('sets the filter key/option into the state', () => {
      const nextState = OnlineMods.setOnlineModFilter(Map(), 'installStatus', 'all')
      expect(nextState).to.equal(fromJS({
        onlineModFilters: { installStatus: 'all' }
      }))
    })
    it('appends a filter into the state if filter options already exist', () => {
      const state = fromJS({
        onlineModFilters: { installStatus: 'all' }
      })
      const nextState = OnlineMods.setOnlineModFilter(state, 'tag', 'all')
      expect(nextState).to.equal(fromJS({
        onlineModFilters: { installStatus: 'all', tag: 'all' }
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

  describe('getsortedMods()', () => {
    it('sorts correctly ascending by name', () => {
      const mods = fromJS([
        { name: 'Mod3' }, { name: 'Mod1' }, { name: 'Mod2' }
      ])
      const sortedMods = OnlineMods.getSortedMods(mods, List.of('name', 'ascending'))
      expect(sortedMods).to.equal(fromJS([
        { name: 'Mod1' }, { name: 'Mod2' }, { name: 'Mod3' }
      ]))
    })

    it('sorts correctly descending by name', () => {
      const mods = fromJS([
        { name: 'Mod1' }, { name: 'Mod3' }, { name: 'Mod2' }
      ])
      const sortedMods = OnlineMods.getSortedMods(mods, List.of('name', 'descending'))
      expect(sortedMods).to.equal(fromJS([
        { name: 'Mod3' }, { name: 'Mod2' }, { name: 'Mod1' }
      ]))
    })

    it('sorts correctly ascending by owner', () => {
      const mods = fromJS([
        { owner: 'Owner3' }, { owner: 'Owner1' }, { owner: 'Owner2' }
      ])
      const sortedMods = OnlineMods.getSortedMods(mods, List.of('owner', 'ascending'))
      expect(sortedMods).to.equal(fromJS([
        { owner: 'Owner1' }, { owner: 'Owner2' }, { owner: 'Owner3' }
      ]))
    })

    it('sorts correctly descending by owner', () => {
      const mods = fromJS([
        { owner: 'Owner2' }, { owner: 'Owner3' }, { owner: 'Owner1' }
      ])
      const sortedMods = OnlineMods.getSortedMods(mods, List.of('owner', 'descending'))
      expect(sortedMods).to.equal(fromJS([
        { owner: 'Owner3' }, { owner: 'Owner2' }, { owner: 'Owner1' }
      ]))
    })

    it('sorts correctly ascending by downloads', () => {
      const mods = fromJS([
        { downloads_count: 20 }, { downloads_count: 30 }, { downloads_count: 10 }
      ])
      const sortedMods = OnlineMods.getSortedMods(mods, List.of('downloads_count', 'ascending'))
      expect(sortedMods).to.equal(fromJS([
        { downloads_count: 10 }, { downloads_count: 20 }, { downloads_count: 30 }
      ]))
    })

    it('sorts correctly descending by downloads', () => {
      const mods = fromJS([
        { downloads_count: 10 }, { downloads_count: 30 }, { downloads_count: 20 }
      ])
      const sortedMods = OnlineMods.getSortedMods(mods, List.of('downloads_count', 'descending'))
      expect(sortedMods).to.equal(fromJS([
        { downloads_count: 30 }, { downloads_count: 20 }, { downloads_count: 10 }
      ]))
    })

    it('sorts correctly ascending by latest release', () => {
      const mods = fromJS([
        { name: 'Mod3', releases: [{ released_at: '2017-04-01T11:34:11.524126Z' }] },
        { name: 'Mod1', releases: [{ released_at: '2017-04-01T15:37:06.204418Z' }] },
        { name: 'Mod2', releases: [{ released_at: '2017-04-01T14:21:10.138075Z' }] }
      ])
      const sortedMods = OnlineMods.getSortedMods(mods, List.of('released_at', 'ascending'))
      expect(sortedMods).to.equal(fromJS([
        { name: 'Mod1', releases: [{ released_at: '2017-04-01T15:37:06.204418Z' }] },
        { name: 'Mod2', releases: [{ released_at: '2017-04-01T14:21:10.138075Z' }] },
        { name: 'Mod3', releases: [{ released_at: '2017-04-01T11:34:11.524126Z' }] }
      ]))
    })

    it('sorts correctly descending by latest release', () => {
      const mods = fromJS([
        { name: 'Mod1', releases: [{ released_at: '2017-04-01T15:37:06.204418Z' }] },
        { name: 'Mod3', releases: [{ released_at: '2017-04-01T11:34:11.524126Z' }] },
        { name: 'Mod2', releases: [{ released_at: '2017-04-01T14:21:10.138075Z' }] }
      ])
      const sortedMods = OnlineMods.getSortedMods(mods, List.of('released_at', 'descending'))
      expect(sortedMods).to.equal(fromJS([
        { name: 'Mod3', releases: [{ released_at: '2017-04-01T11:34:11.524126Z' }] },
        { name: 'Mod2', releases: [{ released_at: '2017-04-01T14:21:10.138075Z' }] },
        { name: 'Mod1', releases: [{ released_at: '2017-04-01T15:37:06.204418Z' }] }
      ]))
    })
  })

  describe('getfilteredMods()', () => {
    it('filters out any installed mods if that option exists', () => {
      const state = fromJS({
        installedMods: [{ name: 'Mod1' }],
        onlineMods: [{ name: 'Mod1' }, { name: 'Mod2' }],
        onlineModFilters: { installStatus: 'installed' }
      })
      const filteredMods = OnlineMods.getFilteredMods(state)
      expect(filteredMods).to.equal(fromJS([
        { name: 'Mod1' }
      ]))
    })

    it('filters out any not installed mods if that option exists', () => {
      const state = fromJS({
        installedMods: [{ name: 'Mod1' }],
        onlineMods: [{ name: 'Mod1' }, { name: 'Mod2' }],
        onlineModFilters: { installStatus: 'not installed' }
      })
      const filteredMods = OnlineMods.getFilteredMods(state)
      expect(filteredMods).to.equal(fromJS([
        { name: 'Mod2' }
      ]))
    })

    it('filters out any mods that do not have the provided tag if set', () => {
      const state = fromJS({
        onlineMods: [
          { name: 'Mod1', tags: [{ name: 'general' }] },
          { name: 'Mod2', tags: [{ name: 'cheats' }] },
          { name: 'Mod3', tags: [{ name: 'logistic-network' }] }
        ],
        onlineModFilters: { tag: 'logistic-network' }
      })
      const filteredMods = OnlineMods.getFilteredMods(state)
      expect(filteredMods).to.equal(fromJS([
        { name: 'Mod3', tags: [{ name: 'logistic-network' }] }
      ]))
    })
  })
})
