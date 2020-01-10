import { readFile } from 'fs'
import { join } from 'path'
import { promisify } from 'util'
import { ipcMain } from 'electron'

import store from '@lib/store'
import log from './logger'

export default class ProfileManager {
  async init () {
    log.debug('Entered function', { namespace: 'main.profile_manager.init' })

    this.configureEventListeners()

    log.debug('Exited function', { namespace: 'main.profile_manager.init' })
  }

  async configureEventListeners () {
    log.debug('Entered function', { namespace: 'main.profile_manager.configureEventListeners' })

    ipcMain.on('SET_ACTIVE_PROFILE', (event, activeProfile) => {
      log.info('Event "SET_ACTIVE_PROFILE" was recieved', { namespace: 'main.events.profile_manager' })

      const profiles = store.get('profiles.list')
      if (profiles.length > 0 && activeProfile >= 0 && activeProfile < profiles.length) {
        store.set('profiles.active', activeProfile)
        log.info(`Active profile changed, index: ${activeProfile}, name: ${profiles[activeProfile].name}`, { namespace: 'main.events.profile_manager' })
      } else {
        log.info(`Unable to change active profile, index: ${activeProfile}`, { namespace: 'main.events.profile_manager' })
      }
    })

    log.debug('Exited function', { namespace: 'main.profile_manager.configureEventListeners' })
  }

  async addProfile () {
    log.debug('Entered function', { namespace: 'main.profile_manager.addProfile' })

    const profiles = store.get('profiles.list', [])
    profiles.push({ name: 'New Profile', mods: [{ name: 'base', title: 'Base Mod', version: store.get('mods.factorioVersion') }] })

    store.set('profiles.list', profiles)
    store.set('profiles.active', profiles.length - 1)

    log.info(`New profile added successfully, new profile count: ${profiles.length}`, { namespace: 'main.profile_manager.addProfile' })

    log.debug('Exited function', { namespace: 'main.profile_manager.addProfile' })
  }

  async updateCurrentProfile (data) {
    log.debug('Entered function', { namespace: 'main.profile_manager.updateCurrentProfile' })

    const profiles = store.get('profiles.list', [])
    const active = store.get('profiles.active')

    if (profiles && profiles[active]) {
      profiles[active] = Object.assign(profiles[active], data)
      store.set('profiles.list', profiles)

      log.info('Successfully updated active profile', { namespace: 'main.profile_manager.updateCurrentProfile' })
    } else {
      log.error(
        `Somehow there was no valid active profile, unable to update | profile count: ${profiles.length} | activeProfileIndex: ${active}`,
        { namespace: 'main.profile_manager.updateCurrentProfile' }
      )
    }

    log.debug('Exited function', { namespace: 'main.profile_manager.updateCurrentProfile' })
  }

  async removeCurrentProfile () {
    log.debug('Entered function', { namespace: 'main.profile_manager.removeCurrentProfile' })

    const profiles = store.get('profiles.list', [])
    const active = store.get('profiles.active')

    if (profiles && profiles[active]) {
      const removed = profiles.splice(active, 1)[0]

      store.set('profiles.active', 0)
      store.set('profiles.list', profiles)

      log.info(
        `Successfully removed active profile '${removed.name}' | new active profile: '${profiles[0].name}'`,
        { namespace: 'main.profile_manager.updateCurrentProfile' }
      )
    } else {
      log.error(
        `Somehow there was no valid active profile, unable to remove | profile count: ${profiles.length} | activeProfileIndex: ${active}`,
        { namespace: 'main.profile_manager.removeCurrentProfile' }
      )
    }

    log.debug('Exited function', { namespace: 'main.profile_manager.removeCurrentProfile' })
  }

  async addModToCurrentProfile (mod) {
    log.debug('Entered function', { namespace: 'main.profile_manager.addModToCurrentProfile' })

    const profiles = store.get('profiles.list', [])
    const active = store.get('profiles.active')

    if (profiles[active]) {
      if (!profiles[active].mods.some(m => m.name === mod.name)) {
        profiles[active].mods.push(mod)
        profiles[active].mods.sort((a, b) => {
          if (a.name === 'base' || a.name < b.name) return -1
          if (b.name === 'base' || a.name > b.name) return 1
          return 0
        })

        store.set('profiles.list', profiles)

        log.info(`Added mod '${mod.name}' to active profile '${profiles[active].name}'`, { namespace: 'main.profile_manager.addModToCurrentProfile' })
      } else {
        log.warn(
          `Not adding mod to active profile: '${mod.name}' was already added to active profile '${profiles[active].name}'`,
          { namespace: 'main.profile_manager.addModToCurrentProfile' }
        )
      }
    } else {
      log.error(
        `Somehow there was no valid active profile, unable to add mod | profile count: ${profiles.length} | activeProfileIndex: ${active}`,
        { namespace: 'main.profile_manager.addModToCurrentProfile' }
      )
    }

    log.debug('Exited function', { namespace: 'main.profile_manager.addModToCurrentProfile' })
  }

  async removeModFromCurrentProfile (mod) {
    log.debug('Entered function', { namespace: 'main.profile_manager.removeModFromCurrentProfile' })

    const profiles = store.get('profiles.list', [])
    const active = store.get('profiles.active')

    if (profiles[active]) {
      const modIndex = profiles[active].mods.findIndex(m => m.name === mod.name)

      if (modIndex > -1) {
        profiles[active].mods.splice(modIndex, 1)
        store.set('profiles.list', profiles)

        log.info(`Removed mod '${mod.name}' from active profile '${profiles[active].name}'`, { namespace: 'main.profile_manager.removeModFromCurrentProfile' })
      } else {
        log.warn(
          `Not removing mod from active profile: '${mod.name}' was not in active profile '${profiles[active].name}'`,
          { namespace: 'main.profile_manager.removeModFromCurrentProfile' }
        )
      }
    } else {
      log.error(
        `Somehow there was no valid active profile, unable to remove mod | profile count: ${profiles.length} | activeProfileIndex: ${active}`,
        { namespace: 'main.profile_manager.removeModFromCurrentProfile' }
      )
    }

    log.debug('Exited function', { namespace: 'main.profile_manager.removeModFromCurrentProfile' })
  }

  async loadProfiles () {
    log.debug('Entered function', { namespace: 'main.profile_manager.loadProfiles' })

    if (store.get('profiles.list').length === 0) {
      log.info('No profiles exist yet, attempting to create starter profiles', { namespace: 'main.profile_manager.loadProfiles' })

      await this.createStarterProfiles()
    } else {
      log.info('Profiles already loaded into the state, no profile initaliation needed', { namespace: 'main.profile_manager.loadProfiles' })
    }

    log.debug('Exited function', { namespace: 'main.profile_manager.loadProfiles' })
  }

  async createStarterProfiles () {
    log.debug('Entered function', { namespace: 'main.profile_manager.createStarterProfiles' })

    const modsPath = store.get('paths.mods')
    if (!modsPath) {
      log.error('modPath not set when creating profiles', { namespace: 'main.profile_manager.createStarterProfiles' })
      throw new Error('Unable to create profiles as the Factorio mods path has not been set.')
    }
    const factorioVersion = store.get('mods.factorioVersion')
    if (!factorioVersion) {
      log.error('factorioVersion not set when creating profiles', { namespace: 'main.profile_manager.createStarterProfiles' })
      throw new Error('Unable to create profiles as the Factorio version has not been set.')
    }

    const installedMods = store.get('mods.installed', [])
    const { mods: modsList } = JSON.parse(await promisify(readFile)(join(modsPath, 'mod-list.json'), 'utf8'))

    const enabledMods = modsList
      .filter(mod => mod.enabled)
      .map(mod => installedMods.find(m => m.name === mod.name))

    const profiles = [
      { name: 'Vanilla', mods: [{ name: 'base', title: 'Base Mod', version: factorioVersion }] },
      { name: 'Existing Mod Settings', mods: enabledMods },
    ]

    store.set({ 'profiles.list': profiles, 'profiles.active': 0 })
    log.info(`Successfully created starter profiles: [${profiles.map(p => p.name)}]`, { namespace: 'main.profile_manager.createStarterProfiles' })

    log.debug('Exited function', { namespace: 'main.profile_manager.createStarterProfiles' })
  }
}
