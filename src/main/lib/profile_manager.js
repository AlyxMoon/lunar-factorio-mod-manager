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

  async loadProfiles () {
    if (store.get('profiles.list').length === 0) {
      await this.createStarterProfiles()
    }
  }

  async createStarterProfiles () {
    const modsPath = store.get('paths.mods')
    if (!modsPath) throw new Error('Unable to create profiles as the Factorio mods path has not been set.')

    const modList = fs.readFileSync(path.join(modsPath, 'mod-list.json'), 'utf8')
    const enabledMods = JSON.parse(modList).mods
      .filter(mod => mod.enabled)
      .map(mod => ({ name: mod.name }))

    store.set({
      'profiles.list': [
        { name: 'Vanilla', mods: [{ name: 'base' }] },
        { name: 'Existing Mod Settings', mods: enabledMods },
      ],
      'profiles.active': 0,
    })
  }
}
