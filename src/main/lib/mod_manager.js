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
      const data = JSON.parse(modData)
      data.name = data.name + '_' + data.version
      return data
    })))

    store.set('mods.installed', installedMods)
    this.parseInstalledModDependencies()
  }

  parseInstalledModDependencies () {
    const parsedMods = store.get('mods.installed', []).map(mod => {
      if (!mod.dependencies) mod.dependencies = ['base']
      if (typeof mod.dependencies === 'string') mod.dependencies = [mod.dependencies]

      mod.dependenciesParsed = mod.dependencies.map(dependency => {
        const prefix = dependency.match(/^\W*/)[0].trim()
        dependency = dependency.replace(/^\W*/, '')

        const name = dependency.match(/^\S*/)[0]
        dependency = dependency.replace(/^\S*/, '').trim()

        const operator = (dependency.match(/^<=|^>=|^=|^<|^>/) || [''])[0]
        dependency = dependency.replace(/^<=|^>=|^=|^<|^>/, '').trim()

        const version = dependency

        return {
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

      return mod
    })

    store.set('mods.installed', parsedMods)
  }

  async deleteMod (name) {
    const mod = store.get('mods.installed', []).find(m => m.name === name)

    if (mod) {
      const filePath = path.join(store.get('paths.mods'), `${mod.name}.zip`)
      await promisify(fs.unlink)(filePath)

      store.set('mods.installed', store.get('mods.installed').filter(m => m.name !== mod.name))
      this.parseInstalledModDependencies()
    }
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
