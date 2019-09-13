import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import store from './store'

export default class DownloadManager {
  constructor (webContents, modManager) {
    this.downloadQueue = []
    this.downloadInProgress = false
    this.modManager = modManager
    this.webContents = webContents
  }

  addDownloadRequest (name, title, version, downloadUrl) {
    const username = store.get('player.username')
    const token = store.get('player.token')

    if (!username || !token) return
    const link = `https://mods.factorio.com${downloadUrl}?username=${username}&token=${token}`
    const existingMod = store.get('mods.installed', []).find(mod => mod.name === name)

    if (!version || (existingMod && existingMod.version === version)) {
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
        ? path.join(store.get('paths.mods'), `${existingMod.name}_${existingMod.version}.zip`)
        : '',
    })

    if (!this.downloadInProgress) {
      this.downloadNextMod()
    }
  }

  downloadNextMod () {
    if (this.downloadQueue.length === 0) return

    const downloadInfo = this.downloadQueue[0]
    this.webContents.send('ADD_TOAST', {
      type: 'info',
      dismissAfter: 4000,
      text: `Beginning download of: ${downloadInfo.title}`,
    })
    this.webContents.downloadURL(downloadInfo.link)
  }

  manageDownload (item) {
    const filePath = path.join(store.get('paths.mods'), item.getFilename())

    item.setSavePath(filePath)
    item.once('done', async (event, state) => {
      if (state === 'completed') {
        const downloadInfo = this.downloadQueue.pop()

        if (downloadInfo.existingModPath) {
          await promisify(fs.unlink)(downloadInfo.existingModPath)
        }

        this.webContents.send('ADD_TOAST', {
          dismissAfter: 4000,
          text: `Finished download of: ${downloadInfo.title}`,
        })

        if (this.downloadQueue.length > 0) {
          this.downloadNextMod()
        } else {
          this.modManager.retrieveListOfInstalledMods()
        }
      } else {
        console.log(2, `Download failed: ${state}`)
      }
    })
  }
}
