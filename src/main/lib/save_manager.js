import { readdir, readFile } from 'fs'
import { join } from 'path'
import { promisify } from 'util'
import jsZip from 'jszip'

import store from '@shared/store'
import log from '@shared/logger'

export default class SaveManager {
  async retrieveFactorioSaves () {
    log.debug('Entered function', { namespace: 'main.save_manager.retrieveFactorioSave' })

    const savesPath = store.get('paths.saveDir')
    if (!savesPath) {
      log.error('Path to the saves folder was not set when trying to retrieve saves', { namespace: 'main.save_manager.retrieveFactorioSave' })
      return
    }

    const saves = []

    try {
      const savesInDirectory = (await promisify(readdir)(savesPath, 'utf8'))
        .filter(filename => filename.endsWith('.zip'))

      await Promise.all(savesInDirectory.map(async (save) => {
        try {
          const buffer = await promisify(readFile)(join(savesPath, save))
          const zip = await jsZip.loadAsync(buffer)

          const previewFile = await zip.file(/preview\.(jpg)|(png)/)[0]
          const imageDataUrl = previewFile
            ? `data:image/${previewFile.name.endsWith('.png') ? 'png' : 'jpeg'};base64,${await previewFile.async('base64')}`
            : ''

          const levelFile = await (await zip.file(/level\.dat/)[0]).async('nodebuffer')
          const { mods, scenario, version } = await this.parseLevelData(levelFile)

          saves.push({
            name: save.slice(0, save.indexOf('.zip')),
            preview: imageDataUrl,
            version,
            scenario,
            mods,
          })
        } catch (error) {
          log.error(`Could not read save file ${save}: ${error.message}`, { namespace: 'main.save_manager.retrieveFactorioSave' })
        }
      }))

      saves.sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })

      log.info(`Saves have been parsed. Save count: ${saves.length}`, { namespace: 'main.save_manager.retrieveFactorioSave' })
    } catch (error) {
      log.error(`Error when loading saves: ${error.message}`, { namespace: 'main.save_manager.retrieveFactorioSave' })
    }

    log.debug('Leaving function', { namespace: 'main.save_manager.retrieveFactorioSave' })
    return saves
  }

  async parseLevelData (levelData) {
    /* eslint-disable no-unused-vars */

    const mods = []
    let modsStartPos = 0
    let scenarioLengthPos = 0

    const vMajor = levelData.readUIntBE(1, 1)
    const vMinor = levelData.readUIntBE(2, 1)
    const vPatch = levelData.readUIntBE(4, 1)
    const version = `${vMajor}.${vMinor}.${vPatch}`

    if (vMinor === 16) {
      modsStartPos = 38
      scenarioLengthPos = 9
    }
    if (vMinor === 17 || vMinor === 18) {
      modsStartPos = 39
      scenarioLengthPos = 10
    }

    const lenScenario = levelData.readUIntBE(scenarioLengthPos, 1)
    const scenario = levelData.toString('utf-8', scenarioLengthPos + 1, scenarioLengthPos + 1 + lenScenario)

    const modCount = levelData.readUIntBE(modsStartPos - 1, 1)

    for (
      let i = modCount, pos = modsStartPos;
      i > 0;
      i--
    ) {
      const length = levelData.readUIntBE(pos, 1)

      const modName = levelData.toString('utf-8', pos + 1, pos + length + 1)
      const vMajor = levelData.readUIntBE(pos + length + 1, 1)
      const vMinor = levelData.readUIntBE(pos + length + 2, 1)
      const vPatch = levelData.readUIntBE(pos + length + 3, 1)

      mods.push({
        name: modName,
        version: `${vMajor}.${vMinor}.${vPatch}`,
      })

      pos += length + 8
    }

    return { version, scenario, mods }
    /* eslint-enable no-unused-vars */
  }
}
