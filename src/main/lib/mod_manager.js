import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import jsZip from 'jszip'
import fetch from 'node-fetch'

import store from '@lib/store'
import log from './logger'

export default class ModManager {
  async retrieveListOfInstalledMods () {
    log.debug('Entered function', { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })

    const modsPath = store.get('paths.mods')
    if (!modsPath) {
      log.error('Path to Factorio mods was not set when trying to retrieve mods', { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })
      throw new Error('Unable to get mods as the Factorio mods path has not been set.')
    }

    const factorioPath = store.get('paths.factorio')
    if (!factorioPath) {
      log.error('Path to the Factorio bin folder was not set when trying to retrieve mods', { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })
      throw new Error('Unable to get base mod info as the Factorio path has not been set.')
    }

    const installedMods = []

    try {
      const baseModData = await promisify(fs.readFile)(path.join(factorioPath, '../../../data/base/info.json'), 'utf8')
      installedMods.push(JSON.parse(baseModData))
      store.set('mods.factorioVersion', installedMods[0].version)

      log.info('Factorio base mod has been parsed and stored in the app.', { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })
    } catch (error) {
      log.error(`Error when loading base mod data: ${error.message}`, { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })
      throw error
    }

    try {
      const filesInDirectory = await promisify(fs.readdir)(modsPath, 'utf8')
      installedMods.push(...await Promise.all(filesInDirectory.filter(elem => elem.slice(-4) === '.zip').map(async (mod) => {
        const buffer = await promisify(fs.readFile)(path.join(modsPath, mod))
        const zip = await jsZip.loadAsync(buffer)
        const modData = await zip.file(/info\.json/)[0].async('text')
        return JSON.parse(modData)
      })))

      log.info(`Installed mods have been parsed. Mod count: ${installedMods.length - 1}`, { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })
    } catch (error) {
      log.error(`Error when loading installed mods: ${error.message}`, { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })
      throw error
    }

    store.set('mods.installed', installedMods)
    log.info('Installed mods have been stored in the app. Parsing dependencies next.', { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })
    this.parseInstalledModDependencies()

    log.debug('Leaving function', { namespace: 'main.mod_manager.retrieveListOfInstalledMods' })
  }

  parseInstalledModDependencies () {
    log.debug('Entered function', { namespace: 'main.mod_manager.parseInstalledModDependencies' })

    try {
      const parsedMods = store.get('mods.installed', []).map((mod, i, mods) => {
        if (!mod.dependencies) mod.dependencies = ['base']
        if (typeof mod.dependencies === 'string') mod.dependencies = [mod.dependencies]

        mod.dependenciesParsed = mod.dependencies.map(dependency => {
          const prefix = dependency.match(/^\W*/)[0].trim()
          dependency = dependency.replace(/^\W*/, '')

          const name = dependency.match(/^[^<>=]*/)[0].trim()
          dependency = dependency.replace(/^[^<>=]*/, '').trim()

          const operator = (dependency.match(/^<=|^>=|^=|^<|^>/) || [''])[0]
          dependency = dependency.replace(/^<=|^>=|^=|^<|^>/, '').trim()

          const version = dependency

          const installed = mods.some(m => m.name === name)

          return {
            installed,
            name,
            operator,
            version,
            type: (() => {
              if (prefix === '!') return 'incompatible'
              if (prefix === '?') return 'optional'
              if (prefix === '(?)') return 'optional-hidden'
              return 'required'
            })(),
          }
        })

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
        const filePath = path.join(store.get('paths.mods'), `${mod.name}_${mod.version}.zip`)
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
      const onlineCount = store.get('mods.onlineCount')
      const onlineLastFetch = store.get('mods.onlineLastFetch')
      if (onlineCount && onlineLastFetch) {
        const now = Date.now()
        if (now - onlineLastFetch <= 86400000) {
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
      store.set({
        'mods.online': data.results,
        'mods.onlineCount': data.results.length,
        'mods.onlineLastFetch': Date.now(),
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

    const index = store.get('mods.online', []).findIndex(m => m.name === modName)
    if (index === -1) {
      log.info(`Attempted to retrieve detailed info for online mod '${modName}' but online mods have not been retrieved yet. Skipping.`, { namespace: 'main.mod_manager.fetchOnlineModDetailedInfo' })
      return
    }

    const onlineMod = store.get('mods.online')[index]
    if (!force) {
      // These two seem to only be provided when getting the /full route, so it's a good check
      if (onlineMod.changelog || onlineMod.github_path) {
        log.info(`Already have retrieved the detailed info for online mod '${modName}'. Skipping retrieval.`, { namespace: 'main.mod_manager.fetchOnlineModDetailedInfo' })
        return
      }
    } else {
      log.info(`Force refresh of online mod '${modName}' has been recieved`, { namespace: 'main.mod_manager.fetchOnlineModDetailedInfo' })
    }

    try {
      const apiUrl = `https://mods.factorio.com/api/mods/${modName}/full`
      const mods = store.get('mods.online')

      mods[index] = await (await fetch(apiUrl)).json()
      store.set({ 'mods.online': mods })

      log.info(`Detailed info successfully retrieved for '${modName}' and saved in the app`, { namespace: 'main.mod_manager.fetchOnlineModDetailedInfo' })
    } catch (error) {
      log.error(`Error when retrieving detailed info for online mod '${modName}': ${error.name}`, { namespace: 'main.mod_manager.fetchOnlineModDetailedInfo' })
    }

    log.debug('Leaving function', { namespace: 'main.mod_manager.fetchOnlineModDetailedInfo' })
  }
}
