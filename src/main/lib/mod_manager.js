import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import jsZip from 'jszip'
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
}
