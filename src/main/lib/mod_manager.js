import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import jsZip from 'jszip'
import fetch from 'node-fetch'

import store from './store'

export default class ModManager {
  async retrieveListOfInstalledMods () {
    console.log(1, 'ModManager.loadInstalledMods() called')

    const modsPath = store.get('paths.mods')
    if (!modsPath) throw new Error('Unable to get mods as the Factorio mods path has not been set.')
    const factorioPath = store.get('paths.factorio')
    if (!factorioPath) throw new Error('Unable to get base mod info as the Factorio path has not been set.')

    const installedMods = []

    const baseModData = await promisify(fs.readFile)(path.join(factorioPath, '../../../data/base/info.json'), 'utf8')
    installedMods.push(JSON.parse(baseModData))
    store.set('mods.factorioVersion', installedMods[0].version)

    const filesInDirectory = await promisify(fs.readdir)(modsPath, 'utf8')
    installedMods.push(...await Promise.all(filesInDirectory.filter(elem => elem.slice(-4) === '.zip').map(async (mod) => {
      const buffer = await promisify(fs.readFile)(path.join(modsPath, mod))
      const zip = await jsZip.loadAsync(buffer)
      const modData = await zip.file(/info\.json/)[0].async('text')
      return JSON.parse(modData)
    })))

    store.set('mods.installed', installedMods)
  }

  // Retrieve full list of current version mods
  // Will save to cache to prevent unecessary queries, unless force is true
  async fetchOnlineMods (force = false) {
    if (!force) {
      const onlineCount = store.get('mods.onlineCount')
      const onlineLastFetch = store.get('mods.onlineLastFetch')
      if (onlineCount && onlineLastFetch) {
        const now = Date.now()

        if (now - onlineLastFetch <= 86400000) return
      }
    }

    const factorioVersion = store.get('mods.factorioVersion')
    const apiUrl = `https://mods.factorio.com/api/mods?page_size=max${factorioVersion ? '&version=' + factorioVersion : ''}`

    const data = await (await fetch(apiUrl)).json()
    store.set({
      'mods.online': data.results,
      'mods.onlineCount': data.results.length,
      'mods.onlineLastFetch': Date.now(),
    })
  }
}
