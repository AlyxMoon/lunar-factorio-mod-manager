import {
  isModUpdateAvailable,
  getOnlineInfoForMod,
} from '@renderer/store/getters'

describe('isModUpdateAvailable', () => {
  it('if installedMods or onlineMods is not set then return false', () => {
    const state1 = {
      installedMods: [
        { name: 'some_mod', title: 'Some Mod', version: '1.0.0' },
      ],
      onlineMods: null,
    }
    const state2 = {
      installedMods: null,
      onlineMods: [
        { name: 'some_mod', title: 'Some Mod', latest_release: { version: '1.0.0' } },
      ],
    }
    const mod = 'some_mod'

    expect(isModUpdateAvailable(state1)(mod)).toBe(false)
    expect(isModUpdateAvailable(state2)(mod)).toBe(false)
  })

  it('if no valid mod is passed, then return false', () => {
    const state = {
      installedMods: [
        { name: 'some_mod', title: 'Some Mod', version: '1.0.0' },
      ],
      onlineMods: [
        { name: 'some_mod', title: 'Some Mod', latest_release: { version: '2.0.0' } },
      ],
    }

    expect(isModUpdateAvailable(state)('')).toBe(false)
  })

  it('if mod is not in onlineMods then return false', () => {
    const state = {
      installedMods: [
        { name: 'some_mod', title: 'Some Mod', version: '1.0.0' },
      ],
      onlineMods: [
        { name: 'some_other_mod', title: 'Some Mod', latest_release: { version: '2.0.0' } },
      ],
    }
    const mod = 'some_mod'

    expect(isModUpdateAvailable(state)(mod)).toBe(false)
  })

  it('if mod version in onlineMods is the same or lower, then return false', () => {
    const state = {
      installedMods: [
        { name: 'some_mod_1', title: 'Some Mod 1', version: '1.0.0' },
        { name: 'some_mod_2', title: 'Some Mod 2', version: '1.0.0' },
      ],
      onlineMods: [
        { name: 'some_mod_1', title: 'Some Mod 1', latest_release: { version: '1.0.0' } },
        { name: 'some_mod_2', title: 'Some Mod 2', latest_release: { version: '0.3.0' } },
      ],
    }
    const mod1 = 'some_mod_1'
    const mod2 = 'some_mod_2'

    expect(isModUpdateAvailable(state)(mod1)).toBe(false)
    expect(isModUpdateAvailable(state)(mod2)).toBe(false)
  })

  it('if mod version in onlineMods is higher, then return true', () => {
    const state = {
      installedMods: [
        { name: 'some_mod_1', title: 'Some Mod', version: '1.0.0' },
        { name: 'some_mod_2', title: 'Some Mod', version: '1.0.0' },
        { name: 'some_mod_3', title: 'Some Mod', version: '1.0.0' },
      ],
      onlineMods: [
        { name: 'some_mod_1', title: 'Some Mod', latest_release: { version: '2.0.0' } },
        { name: 'some_mod_2', title: 'Some Mod', latest_release: { version: '1.1.0' } },
        { name: 'some_mod_3', title: 'Some Mod', latest_release: { version: '1.0.1' } },
      ],
    }
    const mod1 = 'some_mod_1'
    const mod2 = 'some_mod_2'
    const mod3 = 'some_mod_3'

    expect(isModUpdateAvailable(state)(mod1)).toBe(true)
    expect(isModUpdateAvailable(state)(mod2)).toBe(true)
    expect(isModUpdateAvailable(state)(mod3)).toBe(true)
  })
})

describe('getOnlineInfoForMod', () => {
  it('should return undefined if mod is not provided, or onlineMods is undefined', () => {
    const state = {
      onlineMods: [
        { name: 'mod_1', title: 'Mod 1' },
      ],
    }
    const mod = { name: 'mod_1' }

    expect(getOnlineInfoForMod(state)()).toBe(undefined)
    expect(getOnlineInfoForMod({})(mod)).toBe(undefined)
  })

  it('should return undefined if mod does not exists in onlineMods', () => {
    const state = {
      onlineMods: [
        { name: 'mod_1', title: 'Mod 1' },
      ],
    }
    const mod = { name: 'mod_10' }

    expect(getOnlineInfoForMod(state)(mod)).toBe(undefined)
  })

  it('should return the data in onlineMods for the mod passed', () => {
    const state = {
      onlineMods: [
        { name: 'mod_1', title: 'Mod 1', some_other_data: '42' },
        { name: 'mod_2', title: 'Mod 2', some_other_data: '75' },
        { name: 'mod_3', title: 'Mod 3', some_other_data: '10' },
      ],
    }
    const mod1 = { name: 'mod_1' }
    const mod2 = { name: 'mod_2' }

    expect(getOnlineInfoForMod(state)(mod1)).toStrictEqual({ name: 'mod_1', title: 'Mod 1', some_other_data: '42' })
    expect(getOnlineInfoForMod(state)(mod2)).toStrictEqual({ name: 'mod_2', title: 'Mod 2', some_other_data: '75' })
  })
})
