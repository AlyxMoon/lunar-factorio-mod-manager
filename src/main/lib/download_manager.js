import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import store from '@shared/store'
import log from '@shared/logger'

export default class DownloadManager {
  constructor (webContents, modManager) {
    log.debug('Entered function', { namespace: 'main.download_manager.constructor' })

    this.downloadQueue = []
    this.downloadInProgress = false
    this.modManager = modManager
    this.webContents = webContents

    log.debug('Leaving function', { namespace: 'main.download_manager.constructor' })
  }

  addDownloadRequest (name, title, version, downloadUrl) {
    log.debug('Entered function', { namespace: 'main.download_manager.addDownloadRequest' })
    const username = store.get('player.username')
    const token = store.get('player.token')

    if (!username || !token) {
      log.error(`Attempted to download mod '${name}' but could not as user is not authenticated.`, { namespace: 'main.download_manager.addDownloadRequest' })
      return this.webContents.send('ADD_TOAST', {
        type: 'warning',
        dismissAfter: 8000,
        text: `Unable to download mods as player login data has not yet been obtained.`,
      })
    }
    const link = `https://mods.factorio.com${downloadUrl}?username=${username}&token=${token}`
    const existingMod = store.get('mods.installed', []).find(mod => mod.name === name)

    if (!version || (existingMod && existingMod.version === version)) {
      log.info(`Skipped downloading mod '${name}' v. ${version} as same version already installed.`, { namespace: 'main.download_manager.addDownloadRequest' })
      return this.webContents.send('ADD_TOAST', {
        type: 'warning',
        dismissAfter: 8000,
        text: `Not downloading "${title}" as same version of that mod is already downloaded`,
      })
    }

    this.downloadQueue.push({
      name,
      title,
      link,
      existingModPath: existingMod
        ? path.join(store.get('paths.modDir'), `${existingMod.name}_${existingMod.version}.zip`)
        : '',
    })
    log.info(`Added download request to queue: ${name} v. ${version}`)

    if (!this.downloadInProgress) {
      this.downloadNextMod()
    }

    log.debug('Leaving function', { namespace: 'main.download_manager.addDownloadRequest' })
  }

  downloadNextMod () {
    log.debug('Entering function', { namespace: 'main.download_manager.downloadNextMod' })

    if (this.downloadQueue.length === 0) {
      log.info('No mod in queue to download, skipping request.', { namespace: 'main.download_manager.downloadNextMod' })
      return
    }

    const downloadInfo = this.downloadQueue[0]
    this.webContents.send('ADD_TOAST', {
      type: 'info',
      dismissAfter: 4000,
      text: `Beginning download of: ${downloadInfo.title}`,
    })

    this.downloadInProgress = true
    this.webContents.downloadURL(downloadInfo.link)
    log.info('Initiated Electron download process', { namespace: 'main.download_manager.downloadNextMod' })

    log.debug('Leaving function', { namespace: 'main.download_manager.downloadNextMod' })
  }

  manageDownload (item) {
    log.debug('Entering function', { namespace: 'main.download_manager.manageDownload' })

    const filePath = path.join(store.get('paths.modDir'), item.getFilename())

    item.setSavePath(filePath)
    item.once('done', async (event, state) => {
      if (state === 'completed') {
        const downloadInfo = this.downloadQueue.shift()
        log.info(`Recieved completed state for mod download: ${downloadInfo.name}`, { namespace: 'main.download_manager.manageDownload' })

        if (downloadInfo.existingModPath) {
          log.info(`There is an existing mod file, will delete. Path: ${downloadInfo.existingModPath}`, { namespace: 'main.download_manager.manageDownload' })
          try {
            await promisify(fs.unlink)(downloadInfo.existingModPath)
          } catch (error) {
            this.webContents.send('ADD_TOAST', {
              dismissAfter: 10000,
              type: 'error',
              text: `Had an error attempting to delete the old mod file for: ${downloadInfo.title}. The incorrect version may be used when starting Factorio. Path was at: ${downloadInfo.existingModPath}`,
            })
            log.error(`Had an error deleting the existing mod file: ${error.message}`, { namespace: 'main.download_manager.manageDownload' })
          }
        }

        this.webContents.send('ADD_TOAST', {
          dismissAfter: 4000,
          text: `Finished download of: ${downloadInfo.title}`,
        })

        if (this.downloadQueue.length > 0) {
          log.info('Mod download finished, starting next download', { namespace: 'main.download_manager.manageDownload' })
          this.downloadInProgress = true
          this.downloadNextMod()
        } else {
          log.info('Mod download finished, all downloads are finished. Refreshing the internal state.', { namespace: 'main.download_manager.manageDownload' })
          this.downloadInProgress = false
          this.modManager.retrieveListOfInstalledMods()
        }
      } else {
        log.error(`Download failed: ${state}`, { namespace: 'main.download_manager.manageDownload' })
      }
    })

    log.debug('Leaving function', { namespace: 'main.download_manager.manageDownload' })
  }
}
