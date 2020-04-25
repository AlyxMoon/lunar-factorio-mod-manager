import fs from 'fs'
import path from 'path'
import os from 'os'
import { promisify } from 'util'
import { spawn } from 'child_process'
import { app, dialog, ipcMain } from 'electron'
import fetch from 'node-fetch'

import store from '@lib/store'
import log from './logger'
import pathGuesses from '@/main/data/path-guesses'

export default class AppManager {
  async init (mainWindow) {
    log.debug('Entered function', { namespace: 'main.app_manager.init' })

    if (!store.get('paths.factorioExe')) {
      log.info('paths.factorioExe not found in config', { namespace: 'main.app_manager.init' })
      const thePath = await this.findFactorioPath(mainWindow)
      if (thePath) {
        log.info(`paths.factorioExe was retrieved, setting in config: ${thePath}`, { namespace: 'main.app_manager.init' })
        store.set('paths.factorioExe', thePath)
      } else {
        log.error('paths.factorioExe could not be retrieved', { namespace: 'main.app_manager.init' })
      }
    } else {
      log.info('Found paths.factorioExe in config', { namespace: 'main.app_manager.init' })
    }

    if (!store.get('paths.modDir')) {
      log.info('paths.modDir not found in config', { namespace: 'main.app_manager.init' })
      const thePath = await this.findFactorioModPath(mainWindow)
      if (thePath) {
        log.info(`paths.modDir was retrieved, setting in config: ${thePath}`, { namespace: 'main.app_manager.init' })
        store.set('paths.modDir', thePath)
      } else {
        log.error('paths.modDir could not be retrieved', { namespace: 'main.app_manager.init' })
      }
    } else {
      log.info('Found paths.modDir in config', { namespace: 'main.app_manager.init' })
    }

    if (!store.get('paths.saveDir')) {
      log.info('paths.saveDir not found in config', { namespace: 'main.app_manager.init' })
      const thePath = await this.findFactorioSavesPath(mainWindow)
      if (thePath) {
        log.info(`paths.saveDir was retrieved, setting in config: ${thePath}`, { namespace: 'main.app_manager.init' })
        store.set('paths.saveDir', thePath)
      } else {
        log.error('paths.saveDir could not be retrieved', { namespace: 'main.app_manager.init' })
      }
    } else {
      log.info('Found paths.saveDir in config', { namespace: 'main.app_manager.init' })
    }

    if (!store.get('paths.playerDataFile')) {
      log.info('paths.playerDataFile not found in config', { namespace: 'main.app_manager.init' })
      const thePath = await this.findFactorioPlayerData(mainWindow)
      if (thePath) {
        log.info(`paths.playerDataFile was retrieved, setting in config: ${thePath}`, { namespace: 'main.app_manager.init' })
        store.set('paths.playerDataFile', thePath)
      } else {
        log.error('paths.playerDataFile could not be retrieved', { namespace: 'main.app_manager.init' })
      }
    } else {
      log.info('Found paths.playerDataFile in config', { namespace: 'main.app_manager.init' })
    }

    await this.retrievePlayerData(mainWindow)

    await this.configureEventListeners()

    log.debug('Leaving function', { namespace: 'main.app_manager.init' })
  }

  async configureEventListeners () {
    log.debug('Entering function', { namespace: 'main.app_manager.configureEventListeners' })

    ipcMain.on('START_FACTORIO', () => {
      log.info('Event "START_FACTORIO" was recieved', { namespace: 'main.events.app_manager' })
      this.startFactorio()
    })

    log.debug('Leaving function', { namespace: 'main.app_manager.configureEventListeners' })
  }

  async findFactorioPath (mainWindow, forceManual = false) {
    log.debug('Entering function', { namespace: 'main.app_manager.findFactorioPath' })

    if (!forceManual) {
      const paths = pathGuesses.factorioExe

      log.debug('Starting loop to automatically find paths.factorioExe', { namespace: 'main.app_manager.findFactorioPath' })
      for (let i = 0, length = paths.length; i < length; i++) {
        try {
          if (fs.existsSync(paths[i])) {
            log.info('paths.factorioExe found with automatic search', { namespace: 'main.app_manager.findFactorioPath' })
            log.debug(`Exiting function, retval: ${paths[i]}`, { namespace: 'main.app_manager.findFactorioPath' })
            return paths[i]
          }
        } catch (error) {
          if (error.code !== 'ENOENT') {
            log.error(`${error.code} ${error.message}`, { namespace: 'main.app_manager.findFactorioPath' })
            return
          }
        }
      }
    }

    // ------------------------------
    // Prompt if file was not found automatically

    const extensions = []
    if (os.platform() === 'win32') extensions.push('exe')
    if (os.platform() === 'linux') extensions.push('*')
    if (os.platform() === 'darwin') extensions.push('app')

    const gamePath = await dialog.showOpenDialog(mainWindow, {
      title: 'Find location of Factorio executable file',
      properties: ['openFile'],
      filters: [{
        name: 'Factorio Executable',
        extensions,
      }],
    })

    if (gamePath) {
      if (gamePath.canceled) {
        log.info('User canceled dialog window', { namespace: 'main.app_manager.findFactorioPath' })
      } else {
        log.info('paths.factorioExe found with user prompt', { namespace: 'main.app_manager.findFactorioPath' })
        log.debug(`Exiting function, retval: ${gamePath.filePaths[0]}`, { namespace: 'main.app_manager.findFactorioPath' })
        return gamePath.filePaths[0]
      }
    }

    log.debug(`Exiting function`, { namespace: 'main.app_manager.findFactorioPath' })
  }

  async findFactorioModPath (mainWindow, forceManual = false) {
    log.debug('Entering function', { namespace: 'main.app_manager.findFactorioModPath' })

    if (!forceManual) {
      const paths = pathGuesses.modDir

      for (let i = 0, length = paths.length; i < length; i++) {
        try {
          if (fs.existsSync(paths[i])) {
            log.info('paths.modDir found with automatic search', { namespace: 'main.app_manager.findFactorioModPath' })
            log.debug(`Exiting function, retval: ${path.join(paths[i], '..')}`, { namespace: 'main.app_manager.findFactorioModPath' })
            return path.join(paths[i], '..')
          }
        } catch (error) {
          if (error.code !== 'ENOENT') {
            log.error(`${error.code} ${error.message}`, { namespace: 'main.app_manager.findFactorioModPath' })
            return
          }
        }
      }
    }

    // ------------------------------
    // Prompt if we didn't find anything
    const modlistPath = await dialog.showOpenDialog(mainWindow, {
      title: 'Find location of Factorio mods directory',
      properties: ['openDirectory'],
    })

    if (modlistPath) {
      if (modlistPath.canceled) {
        log.info('User canceled dialog window', { namespace: 'main.app_manager.findFactorioModPath' })
      } else {
        log.info('paths.modDir found with user prompt', { namespace: 'main.app_manager.findFactorioModPath' })
        log.debug(`Exiting function, retval: ${modlistPath.filePaths[0]}`, { namespace: 'main.app_manager.findFactorioModPath' })
        return modlistPath.filePaths[0]
      }
    }

    log.debug(`Exiting function`, { namespace: 'main.app_manager.findFactorioModPath' })
  }

  async findFactorioSavesPath (mainWindow, forceManual = false) {
    log.debug('Entering function', { namespace: 'main.app_manager.findFactorioSavesPath' })

    if (!forceManual) {
      // Compile a list of what I guess are common paths
      const paths = pathGuesses.saveDir

      for (let i = 0, length = paths.length; i < length; i++) {
        try {
          if (fs.existsSync(paths[i])) {
            log.info('paths.saveDir found with automatic search', { namespace: 'main.app_manager.findFactorioSavesPath' })
            log.debug(`Exiting function, retval: ${path.join(paths[i])}`, { namespace: 'main.app_manager.findFactorioSavesPath' })
            return path.join(paths[i])
          }
        } catch (error) {
          if (error.code !== 'ENOENT') {
            log.error(`${error.code} ${error.message}`, { namespace: 'main.app_manager.findFactorioSavesPath' })
            return
          }
        }
      }
    }

    // ------------------------------
    // Prompt if we didn't find anything
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Find location of Factorio mods directory',
      properties: ['openDirectory'],
    })

    if (!canceled || !filePaths.length) {
      if (canceled) {
        log.info('User canceled dialog window', { namespace: 'main.app_manager.findFactorioSavesPath' })
      } else {
        log.info('paths.saveDir found with user prompt', { namespace: 'main.app_manager.findFactorioSavesPath' })
        log.debug(`Exiting function, retval: ${filePaths[0]}`, { namespace: 'main.app_manager.findFactorioSavesPath' })
        return filePaths[0]
      }
    }

    log.debug(`Exiting function`, { namespace: 'main.app_manager.findFactorioSavesPath' })
  }

  async findFactorioPlayerData (mainWindow, forceManual = false) {
    log.debug(`Entering function`, { namespace: 'main.app_manager.findFactorioPlayerData' })

    if (!forceManual) {
      // Compile a list of what I guess are common paths
      const paths = pathGuesses.playerDataFile

      for (let i = 0, length = paths.length; i < length; i++) {
        try {
          if (fs.existsSync(paths[i])) {
            log.info('paths.playerDataFile found with automatic search', { namespace: 'main.app_manager.findFactorioPlayerData' })
            log.debug(`Exiting function, retval: ${paths[i]}`, { namespace: 'main.app_manager.findFactorioPlayerData' })
            return paths[i]
          }
        } catch (error) {
          if (error.code !== 'ENOENT') {
            log.error(`${error.code} ${error.message}`, { namespace: 'main.app_manager.findFactorioPlayerData' })
            return
          }
        }
      }
    }

    const playerDataPath = await dialog.showOpenDialog(mainWindow, {
      title: 'Find location of player-data.json file',
      properties: ['openFile'],
      filters: [{
        name: 'Factorio Player Data',
        extensions: ['json'],
      }],
    })

    if (playerDataPath) {
      if (playerDataPath.canceled) {
        log.info('User canceled dialog window', { namespace: 'main.app_manager.findFactorioPlayerData' })
      } else {
        log.info('paths.playerDataFile found with user prompt', { namespace: 'main.app_manager.findFactorioPlayerData' })
        log.debug(`Exiting function, retval: ${playerDataPath.filePaths[0]}`, { namespace: 'main.app_manager.findFactorioPlayerData' })
        return playerDataPath.filePaths[0]
      }
    }

    log.debug(`Exiting function`, { namespace: 'main.app_manager.findFactorioPlayerData' })
  }

  async retrievePlayerData (mainWindow) {
    log.debug(`Entering function`, { namespace: 'main.app_manager.retrievePlayerData' })

    const player = store.get('player')
    if (!player.username || !player.token) {
      log.info('username/token has not been set yet, attempting to retrieve', { namespace: 'main.app_manager.retrievePlayerData' })

      const playerDataPath = store.get('paths.playerDataFile')
      if (!playerDataPath) {
        log.error('Unable to retrieve player data, paths.playerDataFile not set', { namespace: 'main.app_manager.retrievePlayerData' })
        return
      }

      let data
      try {
        data = JSON.parse(await promisify(fs.readFile)(playerDataPath, 'utf8'))
      } catch (error) {
        log.error(`${error.code} ${error.message}`, { namespace: 'main.app_manager.retrievePlayerData' })
      }

      if (!data['service-username'] || !data['service-token']) {
        log.info('username/token not in player-data.json file', { namespace: 'main.app_manager.retrievePlayerData' })
        mainWindow.webContents.send('ADD_TOAST', {
          type: 'warning',
          text: 'Unable to get user info from the player-data.json file. This is likely due to not having opened Factorio before. You will be unable to download online mods through this app.',
          dismissAfter: 12000,
        })
      } else {
        log.info(`setting username/token in config. Username: '${data['service-username']}', Token: [REDACTED]`)
        store.set('player.username', data['service-username'])
        store.set('player.token', data['service-token'])
      }
    } else {
      log.info('username/token already set, skipping retrieve', { namespace: 'main.app_manager.retrievePlayerData' })
    }

    log.debug(`Exiting function`, { namespace: 'main.app_manager.retrievePlayerData' })
  }

  async updateModListJSON () {
    log.debug(`Entering function`, { namespace: 'main.app_manager.updateModListJSON' })
    log.info('Beginning to run updateModListJSON', { namespace: 'main.app_manager.updateModListJSON' })
    log.profile('TIME updateModListJSON')

    const profileIndex = store.get('profiles.active')
    if (!profileIndex && profileIndex !== 0) {
      log.error(`profiles.active wasn't set in config. Weird. Not changing mod-list.json`, { namespace: 'main.app_manager.updateModListJSON' })
      return
    }

    const profile = store.get('profiles.list', [])[profileIndex]
    if (!profile) {
      log.error(`profile wasn't in config. Weird. Not changing mod-list.json`, { namespace: 'main.app_manager.updateModListJSON' })
      return
    }

    const installedMods = store.get('mods.installed')
    if (!installedMods || installedMods.length === 0) {
      log.error(`no installed mods were in config. That shouldn't happen. Not changing mod-list.json`, { namespace: 'main.app_manager.updateModListJSON' })
      return
    }

    const modListData = JSON.stringify({
      mods: installedMods.map(mod => ({
        name: mod.name,
        enabled: profile.mods.some(m => m.name === mod.name),
      })),
    }, null, 4)

    try {
      fs.writeFileSync(path.join(store.get('paths.modDir'), 'mod-list.json'), modListData)
      log.info('Successfully updated mod-list.json file', { namespace: 'main.app_manager.updateModListJSON' })
    } catch (error) {
      log.error(`${error.code} ${error.message}`, { namespace: 'main.app_manager.updateModListJSON' })
    }

    log.profile('TIME updateModListJSON')
    log.debug(`Exiting function`, { namespace: 'main.app_manager.updateModListJSON' })
  }

  async startFactorio () {
    log.debug(`Entering function`, { namespace: 'main.app_manager.startFactorio' })

    const factorioPath = store.get('paths.factorioExe')
    if (!factorioPath) {
      log.error('paths.factorioExe not in config, unable to start game', { namespace: 'main.app_manager.startFactorio' })
      return
    }

    log.info('Calling updateModListJSON() before starting Factorio', { namespace: 'main.app_manager.startFactorio' })
    this.updateModListJSON()

    log.info('Attempting to spawn Factorio process', { namespace: 'main.app_manager.startFactorio' })
    try {
      switch (os.platform()) {
        case 'win32':
          spawn('factorio.exe', [], {
            stdio: 'ignore',
            detached: true,
            cwd: factorioPath.slice(0, factorioPath.indexOf('factorio.exe')),
          }).unref()
          break
        case 'linux':
        case 'darwin':
          spawn(factorioPath).unref()
          break
      }
    } catch (error) {
      log.error(`${error.code} ${error.message}`, { namespace: 'main.app_manager.startFactorio' })
    }

    if (store.get('options.closeOnStartup')) {
      this.closeApp()
    }

    log.debug(`Exiting function`, { namespace: 'main.app_manager.startFactorio' })
  }

  async retrieveLatestAppVersion () {
    const url = 'https://api.github.com/repos/AlyxMoon/lunars-factorio-mod-manager/releases/latest'
    const options = {
      headers: {
        'User-Agent': 'request',
      },
    }

    const data = await (await fetch(url, options)).json()
    return data.tag_name.slice(1)
  }

  async closeApp () {
    log.info('Calling app.quit()', { namespace: 'main.app_manager.closeApp' })
    app.quit()
  }
}
