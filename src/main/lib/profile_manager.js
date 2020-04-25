import { readFile, writeFile } from 'fs'
import { join } from 'path'
import { promisify } from 'util'
import { dialog, ipcMain } from 'electron'

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

    ipcMain.handle('EXPORT_PROFILE', (event) => {
      log.info('Event "EXPORT_PROFILE" was recieved', { namespace: 'main.events.profile_manager' })
      return this.exportProfile(event.sender.webContents)
    })

    ipcMain.handle('IMPORT_PROFILE', (event) => {
      log.info('Event "IMPORT_PROFILE" was recieved', { namespace: 'main.events.profile_manager' })
      return this.importProfile(event.sender.webContents)
    })

    log.debug('Exited function', { namespace: 'main.profile_manager.configureEventListeners' })
  }

  addProfile ({ name = 'New Profile', mods } = {}) {
    log.debug('Entered function', { namespace: 'main.profile_manager.addProfile' })

    const profiles = store.get('profiles.list', [])
    profiles.push({
      name,
      mods: mods
        ? mods.map(({ name, title, version }) => ({ name, title, version }))
        : [{ name: 'base', title: 'Base Mod', version: store.get('mods.factorioVersion') }],
    })

    store.set({
      'profiles.list': profiles,
      'profiles.active': profiles.length - 1,
    })

    log.info(`New profile added successfully, new profile count: ${profiles.length}`, { namespace: 'main.profile_manager.addProfile' })

    log.debug('Exited function', { namespace: 'main.profile_manager.addProfile' })
    return profiles[profiles.length - 1]
  }

  updateCurrentProfile (data) {
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

  removeCurrentProfile () {
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

  addModToProfile (mod, profileIndex = store.get('profiles.active')) {
    log.debug('Entered function', { namespace: 'main.profile_manager.addModToProfile' })

    const profiles = store.get('profiles.list', [])

    if (profiles[profileIndex]) {
      if (!profiles[profileIndex].mods.some(m => m.name === mod.name)) {
        profiles[profileIndex].mods.push(({
          name: mod.name, title: mod.title, version: mod.version,
        }))
        profiles[profileIndex].mods.sort((a, b) => {
          if (a.name === 'base' || a.name < b.name) return -1
          if (b.name === 'base' || a.name > b.name) return 1
          return 0
        })

        store.set('profiles.list', profiles)

        log.info(`Added mod '${mod.name}' to profile '${profiles[profileIndex].name}'`, { namespace: 'main.profile_manager.addModToProfile' })
      } else {
        log.warn(
          `Not adding mod to profile: '${mod.name}' was already added to profile '${profiles[profileIndex].name}'`,
          { namespace: 'main.profile_manager.addModToProfile' }
        )
      }
    } else {
      log.error(
        `Somehow there was no valid profile, unable to add mod | profile count: ${profiles.length} | index: ${profileIndex}`,
        { namespace: 'main.profile_manager.addModToProfile' }
      )
    }

    log.debug('Exited function', { namespace: 'main.profile_manager.addModToProfile' })
  }

  removeModFromCurrentProfile (mod) {
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

    const modsPath = store.get('paths.modDir')
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
      .map(({ name, title, version }) => ({ name, title, version }))

    const profiles = [
      { name: 'Vanilla', mods: [{ name: 'base', title: 'Base Mod', version: factorioVersion }] },
      { name: 'Existing Mod Settings', mods: enabledMods },
    ]

    store.set({ 'profiles.list': profiles, 'profiles.active': 0 })
    log.info(`Successfully created starter profiles: [${profiles.map(p => p.name)}]`, { namespace: 'main.profile_manager.createStarterProfiles' })

    log.debug('Exited function', { namespace: 'main.profile_manager.createStarterProfiles' })
  }

  async exportProfile (replyChannel, profileIndex) {
    log.debug('Entered function', { namespace: 'main.profile_manager.exportProfile' })

    const p = (!profileIndex && profileIndex !== 0)
      ? store.get('profiles.active')
      : profileIndex
    const profile = store.get(`profiles.list.${p}`)

    if (!profile) {
      log.info(`Index for profile to save was invalid or there was another issue. Index: ${p}`, { namespace: 'main.profile_manager.exportProfile' })
      return
    }

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export profile',
      defaultPath: profile.name,
      buttonLabel: 'Export',
      filters: [{ name: 'LFMM Profile Data', extensions: ['json'] }],
    })

    if (canceled || !filePath) {
      log.info('Not exporting profile as dialog was canceled', { namespace: 'main.profile_manager.exportProfile' })
      return
    }

    const formattedPath = filePath + (filePath.endsWith('.json') ? '' : '.json')

    log.info(`Exporting profile, location: ${formattedPath}`)
    try {
      await promisify(writeFile)(formattedPath, JSON.stringify(profile, null, 2))

      replyChannel.send('ADD_TOAST', { text: 'Successfully exported profile' })
      log.info(`Successfully exported profile, location: ${formattedPath}`)
    } catch (error) {
      replyChannel.send('ADD_TOAST', { text: 'Failed to export profile', type: 'danger' })
      log.info(`Failed to export profile, location: ${formattedPath} | ${error.message}`)
    }

    log.debug('Exited function', { namespace: 'main.profile_manager.exportProfile' })
    return formattedPath
  }

  async importProfile (replyChannel) {
    log.debug('Entered function', { namespace: 'main.profile_manager.importProfile' })

    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Import profile',
      properties: ['openFile'],
      filters: [{ name: 'LFMM Profile Data', extensions: ['json'] }],
    })

    if (canceled || !filePaths[0]) {
      log.info('Not importing profile as dialog was canceled', { namespace: 'main.profile_manager.importProfile' })
      return
    }

    log.info(`Importing profile, location: ${filePaths[0]}`)
    try {
      const profile = JSON.parse(await promisify(readFile)(filePaths[0]))
      if (!this.isValidProfile(profile)) throw new Error('profile data was invalid')

      this.addProfile(profile)

      replyChannel.send('ADD_TOAST', { text: 'Successfully imported profile' })
      log.info(`Successfully imported profile, location: ${filePaths[0]}`)
    } catch (error) {
      replyChannel.send('ADD_TOAST', { text: 'Failed to import profile', type: 'danger' })
      log.info(`Failed to import profile, location: ${filePaths[0]} | ${error.message}`)
    }

    log.debug('Exited function', { namespace: 'main.profile_manager.importProfile' })
  }

  isValidProfile (profileData) {
    if (typeof profileData !== 'object') return false

    const keys = ['name', 'mods']
    const modKeys = ['name', 'title', 'version']

    for (const item in profileData) {
      if (!keys.includes(item)) return false
    }

    if (!Array.isArray(profileData.mods)) return false
    for (const mod of profileData.mods) {
      if (!modKeys.every(key => key in mod)) return false
    }

    return true
  }
}
