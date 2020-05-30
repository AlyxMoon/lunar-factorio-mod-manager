import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import jsZip from 'jszip'
import fetch from 'node-fetch'

import {
  config as store,
  onlineModsCache,
} from '@shared/store'
import log from '@shared/logger'

import { parseModDependencies } from '@shared/util'

export default class ModManager {
  async retrieveListOfInstalledMods () {
    log.debug('Entered function', { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })

    const { modDir } = store.get(`environments.list.${store.get('environments.active')}`).paths
    if (!modDir) {
      log.error(
        'Path to Factorio mods was not set when trying to retrieve mods',
        { namespace: 'main.mod_manager.retrieveListOfInstalledMods' }
      )
      return
    }

    const { factorioDataDir } = store.get(`environments.list.${store.get('environments.active')}`).paths
    if (!factorioDataDir) {
      log.error(
        'Path to the Factorio bin folder was not set when trying to retrieve mods',
        { namespace: 'main.mod_manager.retrieveListOfInstalledMods' }
      )
    }

    const installedMods = []

    try {
      const baseModPath = path.join(factorioDataDir, '/base/info.json')
      const baseModData = await promisify(fs.readFile)(baseModPath, 'utf8')

      installedMods.push(JSON.parse(baseModData))
      store.set('mods.factorioVersion', installedMods[0].version)

      log.info('Factorio base mod has been parsed and stored in the app.', { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })
    } catch (error) {
      log.error(`Error when loading base mod data: ${error.message}`, { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })
      return
    }

    try {
      const filesInDirectory = await promisify(fs.readdir)(modDir, 'utf8')
      const modFiles = filesInDirectory.filter(elem => elem.slice(-4) === '.zip')

      for (const file of modFiles) {
        try {
          installedMods.push(await this.getModDataFromZip(file))
        } catch (error) {
          log.error(`Error when parsing a mod file | mod: ${file} | error: ${error.message}`, { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })
        }
      }
    } catch (error) {
      log.error(`Error when loading installed mods: ${error.message}`, { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })
      throw error
    }

    log.info(`Installed mods have been parsed. Mod count: ${installedMods.length - 1}`, { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })

    store.set('mods.installed', installedMods)
    log.info('Installed mods have been stored in the app. Parsing dependencies next.', { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })
    this.parseInstalledModDependencies()

    log.debug('Leaving function', { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })
  }

  parseInstalledModDependencies () {
    log.debug('Entered function', { namespace: 'main.mod_manager.parseInstalledModDependencies' })

    try {
      const parsedMods = store.get('mods.installed', []).map((mod, _, mods) => {
        mod.dependenciesParsed = parseModDependencies(mod.dependencies, mods)
        mod.hasMissingRequiredDependencies = mod.dependenciesParsed.some(d => d.type === 'required' && !d.installed)
        return mod
      })

      store.set('mods.installed', parsedMods)
      log.info('Mod dependencies have been parsed and stored in the app.', { namespace: 'main.mod_manager.parseInstalledModDependencies' })
    } catch (error) {
      log.error(`Error when parsing mod dependencies: ${error.message}`, { namespace: 'main.mod_manager.parseInstalledModDependencies' })
      throw error
    }

    log.debug('Leaving function', { namespace: 'main.mod_manager.parseInstalledModDependencies' })
  }

  async deleteMod (name) {
    log.debug('Entered function', { namespace: 'main.mod_manager.deleteMod' })

    try {
      const mod = store.get('mods.installed', []).find(m => m.name === name)
      if (mod) {
        const { modDir } = store.get(`environments.list.${store.get('environments.active')}`).paths
        const filePath = path.join(modDir, `${mod.name}_${mod.version}.zip`)
        await promisify(fs.unlink)(filePath)

        store.set('mods.installed', store.get('mods.installed').filter(m => m.name !== mod.name))

        log.info(`Successfully deleted mod '${name}'`, { namespace: 'main.mod_manager.deleteMod' })
        this.parseInstalledModDependencies()
      } else {
        log.info(`Recieved request to delete mod '${name}' but it was not in the installed mod list. Skipping.`, { namespace: 'main.mod_manager.deleteMod' })
      }
    } catch (error) {
      log.error(`Error when deleting a mod: ${error.message}`, { namespace: 'main.mod_manager.deleteMod' })
      throw error
    }

    log.debug('Leaving function', { namespace: 'main.mod_manager.deleteMod' })
  }

  // Retrieve full list of current version mods
  // Will save to cache to prevent unecessary queries, unless force is true
  async fetchOnlineMods (force = false) {
    log.debug('Entered function', { namespace: 'main.mod_manager.fetchOnlineMods' })

    if (!force) {
      const onlineCount = onlineModsCache.get('count')
      const onlineLastFetch = onlineModsCache.get('lastFetch')
      const pollingInterval = store.get('options.onlinePollingInterval')

      if (onlineCount && onlineLastFetch) {
        const now = Date.now()
        if (now - onlineLastFetch <= (pollingInterval * 86400000)) {
          log.info('Skipping refresh of online mod list, as last fetch time was too recent.', { namespace: 'main.mod_manager.fetchOnlineMods' })
          return
        }
      }
    } else {
      log.info('Force refresh of online mod list has been recieved', { namespace: 'main.mod_manager.fetchOnlineMods' })
    }

    const factorioVersion = store.get('mods.factorioVersion')
    const apiUrl = `https://mods.factorio.com/api/mods?page_size=max${factorioVersion ? '&version=' + factorioVersion : ''}`

    try {
      const data = await (await fetch(apiUrl)).json()
      onlineModsCache.set({
        mods: data.results,
        count: data.results.length,
        lastFetch: Date.now(),
      })
      log.info(`Successfully retrieved list of online mods. Count: ${data.results.length}`, { namespace: 'main.mod_manager.fetchOnlineMods' })
    } catch (error) {
      log.error(`Error when fetching online mod list: ${error.message}`, { namespace: 'main.mod_manager.fetchOnlineMods' })
      return
    }

    log.debug('Leaving function', { namespace: 'main.mod_manager.fetchOnlineMods' })
  }

  async fetchOnlineModDetailedInfo (modName, force = false) {
    log.debug('Entered function', { namespace: 'main.mod_manager.fetchOnlineModDetailedInfo' })

    const index = onlineModsCache.get('mods', []).findIndex(m => m.name === modName)
    if (index === -1) {
      log.info(`Attempted to retrieve detailed info for online mod '${modName}' but online mods have not been retrieved yet. Skipping.`, { namespace: 'main.mod_manager.fetchOnlineModDetailedInfo' })
      return
    }

    const onlineMod = onlineModsCache.get('mods')[index]
    if (!force) {
      // These two seem to only be provided when getting the /full route, so it's a good check
      if (onlineMod.changelog || onlineMod.github_path) {
        log.info(`Already have retrieved the detailed info for online mod '${modName}'. Skipping retrieval.`, { namespace: 'main.mod_manager.fetchOnlineModDetailedInfo' })
        return onlineMod
      }
    } else {
      log.info(`Force refresh of online mod '${modName}' has been recieved`, { namespace: 'main.mod_manager.fetchOnlineModDetailedInfo' })
    }

    const mods = onlineModsCache.get('mods')
    try {
      const apiUrl = `https://mods.factorio.com/api/mods/${modName}/full`

      mods[index] = await (await fetch(apiUrl)).json()
      onlineModsCache.set({ mods: mods })

      log.info(`Detailed info successfully retrieved for '${modName}' and saved in the app`, { namespace: 'main.mod_manager.fetchOnlineModDetailedInfo' })
    } catch (error) {
      log.error(`Error when retrieving detailed info for online mod '${modName}': ${error.name}`, { namespace: 'main.mod_manager.fetchOnlineModDetailedInfo' })
    }

    log.debug('Leaving function', { namespace: 'main.mod_manager.fetchOnlineModDetailedInfo' })
    return mods[index]
  }

  async getModDataFromZip (filepath) {
    if (!filepath) return
    const { modDir } = store.get(`environments.list.${store.get('environments.active')}`).paths

    let buffer, zip

    try {
      buffer = await promisify(fs.readFile)(path.join(modDir, filepath))
      zip = await jsZip.loadAsync(buffer)
    } catch (error) {
      throw new Error(`Could not read the zip file, it may be corrupted or exist, ${error.message}`)
    }

    const infoFile = await zip.file(/info\.json/)[0]
    if (!infoFile) throw new Error('There was no info.json in the provided zip file')

    const modData = await infoFile.async('text')

    return JSON.parse(modData)
  }
}
