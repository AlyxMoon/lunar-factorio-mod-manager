import { readdir, readFile } from 'fs'
import { join } from 'path'
import { promisify } from 'util'
import jsZip from 'jszip'

import store from '@lib/store'
import log from './logger'

export default class SaveManager {
  async retrieveFactorioSaves () {
    log.debug('Entered function', { namespace: 'main.save_manager.retrieveFactorioSave' })

    const savesPath = store.get('paths.saves')
    if (!savesPath) {
      log.error('Path to the saves folder was not set when trying to retrieve saves', { namespace: 'main.save_manager.retrieveFactorioSave' })
      throw new Error('Unable to get saves info as the saves path has not been set.')
    }

    const saves = []

    try {
      const savesInDirectory = await promisify(readdir)(savesPath, 'utf8')
      saves.push(...await Promise.all(savesInDirectory
        .filter(filename => filename.endsWith('.zip'))
        .map(async (save) => {
          const buffer = await promisify(readFile)(join(savesPath, save))
          const zip = await jsZip.loadAsync(buffer)

          const previewFile = await zip.file(/preview\.(jpg)|(png)/)[0]
          const imageDataUrl = previewFile
            ? `data:image/${previewFile.name.endsWith('.png') ? 'png' : 'jpeg'};base64,${await previewFile.async('base64')}`
            : ''

          return {
            name: save.slice(0, save.indexOf('.zip')),
            preview: imageDataUrl,
          }
        })
      ))

      log.info(`Saves have been parsed. Save count: ${saves.length}`, { namespace: 'main.save_manager.retrieveFactorioSave' })
    } catch (error) {
      log.error(`Error when loading saves: ${error.message}`, { namespace: 'main.save_manager.retrieveFactorioSave' })
    }

    log.debug('Leaving function', { namespace: 'main.save_manager.retrieveFactorioSave' })
    return saves
  }
}
