import fs from 'fs'
import path from 'path'
import { ipcMain } from 'electron'
import store from './store'

export default class ProfileManager {
  async init () {
    this.configureEventListeners()
  }

  async configureEventListeners () {
    ipcMain.on('SET_ACTIVE_PROFILE', (event, activeProfile) => {
      const profiles = store.get('profiles.list')
      if (profiles.length > 0 && activeProfile >= 0 && activeProfile < profiles.length) {
        store.set('profiles.active', activeProfile)
      }
    })
  }

  async addProfile () {
    const profiles = store.get('profiles.list') || []
    profiles.push({ name: 'New Profile', mods: [{ name: 'base', version: store.get('mods.factorioVersion') }] })

    store.set('profiles.list', profiles)
    store.set('profiles.active', profiles.length - 1)
  }

  async updateCurrentProfile (data) {
    const profiles = store.get('profiles.list')
    const active = store.get('profiles.active')

    if (profiles && profiles[active]) {
      profiles[active] = Object.assign(profiles[active], data)
      store.set('profiles.list', profiles)
    }
  }

  async removeCurrentProfile () {
    const profiles = store.get('profiles.list')
    const active = store.get('profiles.active')

    if (profiles && profiles.length > 0 && active >= 0) {
      profiles.splice(active, 1)

      store.set('profiles.active', 0)
      store.set('profiles.list', profiles)
    }
  }

  async addModToCurrentProfile (mod) {
    const profiles = store.get('profiles.list')
    const i = store.get('profiles.active')

    if (!profiles[i].mods.some(m => m.name === mod.name)) {
      profiles[i].mods.push(mod)
      profiles[i].mods.sort((a, b) => {
        if (a.name === 'base') return -1
        if (b.name === 'base') return 1

        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })

      store.set('profiles.list', profiles)
    }
  }

  async removeModFromCurrentProfile (mod) {
    const profiles = store.get('profiles.list')
    const i = store.get('profiles.active')

    profiles[i].mods = profiles[i].mods.filter(m => m.name !== mod.name)
    store.set('profiles.list', profiles)
  }

  async loadProfiles () {
    if (store.get('profiles.list').length === 0) {
      await this.createStarterProfiles()
    }
  }

  async createStarterProfiles () {
    const modsPath = store.get('paths.mods')
    if (!modsPath) throw new Error('Unable to create profiles as the Factorio mods path has not been set.')

    const installedMods = store.get('mods.installed')
    const modsList = JSON.parse(fs.readFileSync(path.join(modsPath, 'mod-list.json'), 'utf8')).mods
    const enabledMods = modsList
      .filter(mod => mod.enabled)
      .map(mod => installedMods.find(m => m.name === mod.name))

    store.set({
      'profiles.list': [
        { name: 'Vanilla', mods: [{ name: 'base', version: store.get('mods.factorioVersion') }] },
        { name: 'Existing Mod Settings', mods: enabledMods },
      ],
      'profiles.active': 0,
    })
  }
}
