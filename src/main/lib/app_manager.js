import fs from 'fs'
import path from 'path'
import os from 'os'
import { promisify } from 'util'
import { spawn } from 'child_process'
import { app, dialog, ipcMain } from 'electron'
import fetch from 'node-fetch'

import store from '@shared/store'
import log from '@shared/logger'
import pathGuesses from '@/data/path-guesses'

export default class AppManager {
  async init (mainWindow) {
    log.debug('Entered function', { namespace: 'main.app_manager.init' })

    if (!store.get('meta.firstRun')) {
      await this.initiateFirstRun(mainWindow)
    } else {
      await this.retrievePlayerData(mainWindow)
      await this.configureEventListeners()
    }

    log.debug('Leaving function', { namespace: 'main.app_manager.init' })
  }

  async initiateFirstRun (mainWindow) {
    const environment = {
      name: 'default',
      default: true,
      paths: {},
    }

    for (const type in pathGuesses) {
      const thePath = await this.attemptToFindPath(type)
      if (thePath) {
        log.info(`paths.${type} was retrieved: ${thePath}`, { namespace: 'main.app_manager.init' })
        environment.paths[type] = thePath
      }
    }

    store.set('environments.list', [environment])
    mainWindow.webContents.send('CHANGE_PAGE', 'PageFirstRun')
  }

  async configureEventListeners () {
    log.debug('Entering function', { namespace: 'main.app_manager.configureEventListeners' })

    ipcMain.on('START_FACTORIO', () => {
      log.info('Event "START_FACTORIO" was recieved', { namespace: 'main.events.app_manager' })
      this.startFactorio()
    })

    log.debug('Leaving function', { namespace: 'main.app_manager.configureEventListeners' })
  }

  async attemptToFindPath (type) {
    log.debug('Entering function', { namespace: 'main.app_manager.attemptToFindPath' })

    if (!['factorioDataDir', 'factorioExe', 'modDir', 'playerDataFile', 'saveDir'].includes(type)) {
      log.error(`Incorrect path type passed: ${type}`, { namespace: 'main.app_manager.attemptToFindPath' })
      return
    }

    const paths = pathGuesses[type]

    log.debug(`Starting loop to automatically find paths.${type}`, { namespace: 'main.app_manager.attemptToFindPath' })
    for (let i = 0, length = paths.length; i < length; i++) {
      try {
        if (fs.existsSync(paths[i])) {
          log.info(`paths.${type} found with automatic search`, { namespace: 'main.app_manager.attemptToFindPath' })
          log.debug(`Exiting function, retval: ${paths[i]}`, { namespace: 'main.app_manager.attemptToFindPath' })

          return paths[i]
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          log.error(`${error.code} ${error.message}`, { namespace: 'main.app_manager.attemptToFindPath' })
          return
        }
      }
    }

    log.info(`Was not able to find paths.${type} with automatic search`, { namespace: 'main.app_manager.attemptToFindPath' })
    log.debug(`Exiting function`, { namespace: 'main.app_manager.attemptToFindPath' })
  }

  async promptForPath (mainWindow, type) {
    log.debug('Entering function', { namespace: 'main.app_manager.promptForPath' })

    if (!['factorioDataDir', 'factorioExe', 'modDir', 'playerDataFile', 'saveDir'].includes(type)) {
      log.error(`Incorrect path type passed: ${type}`, { namespace: 'main.app_manager.promptForPath' })
      return
    }

    let options = {}
    const extensions = []

    if (os.platform() === 'win32') extensions.push('exe')
    if (os.platform() === 'linux') extensions.push('*')
    if (os.platform() === 'darwin') extensions.push('app')

    if (type === 'factorioDataDir') {
      options = {
        title: 'Find location of Factorio data folder',
        properties: ['openDirectory'],
      }
    }

    if (type === 'factorioExe') {
      options = {
        title: 'Find location of Factorio executable file',
        properties: ['openFile'],
        filters: [{
          name: 'Factorio Executable',
          extensions,
        }],
      }
    }

    if (type === 'modDir') {
      options = {
        title: 'Find location of Factorio mods directory',
        properties: ['openDirectory'],
      }
    }

    if (type === 'playerDataFile') {
      options = {
        title: 'Find location of player-data.json file',
        properties: ['openFile'],
        filters: [{
          name: 'Factorio Player Data',
          extensions: ['json'],
        }],
      }
    }

    if (type === 'saveDir') {
      options = {
        title: 'Find location of Factorio saves directory',
        properties: ['openDirectory'],
      }
    }

    const gamePath = await dialog.showOpenDialog(mainWindow, options)

    if (gamePath) {
      if (gamePath.canceled) {
        log.info('User canceled dialog window', { namespace: 'main.app_manager.promptForPath' })
      } else {
        log.info(`paths.${type} found with user prompt`, { namespace: 'main.app_manager.promptForPath' })
        log.debug(`Exiting function, retval: ${gamePath.filePaths[0]}`, { namespace: 'main.app_manager.promptForPath' })
        return gamePath.filePaths[0]
      }
    }

    log.debug(`Exiting function`, { namespace: 'main.app_manager.promptForPath' })
  }

  async retrievePlayerData (mainWindow) {
    log.debug(`Entering function`, { namespace: 'main.app_manager.retrievePlayerData' })

    const player = store.get('player')
    if (!player.username || !player.token) {
      log.info('username/token has not been set yet, attempting to retrieve', { namespace: 'main.app_manager.retrievePlayerData' })

      const playerDataPath = store.get(`environments.list.${store.get('environments.active')}`).paths
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

  updateActiveEvironment ({ index, name }) {
    if (index || index === 0) {
      store.set('environments.active', index)
    }

    if (name) {
      const environments = store.get('environments.list')
      const index = environments.findIndex(env => env.name === name)

      if (index > -1) store.set('environments.active', index)
    }
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
      const { modDir } = store.get(`environments.list.${store.get('environments.active')}`).paths

      if (!modDir) {
        log.error('paths.modDir not in config, unable to update mod-list.json', { namespace: 'main.app_manager.updateModListJSON' })
        return
      }

      fs.writeFileSync(path.join(modDir, 'mod-list.json'), modListData)
      log.info('Successfully updated mod-list.json file', { namespace: 'main.app_manager.updateModListJSON' })
    } catch (error) {
      log.error(`${error.code} ${error.message}`, { namespace: 'main.app_manager.updateModListJSON' })
    }

    log.profile('TIME updateModListJSON')
    log.debug(`Exiting function`, { namespace: 'main.app_manager.updateModListJSON' })
  }

  async startFactorio () {
    log.debug(`Entering function`, { namespace: 'main.app_manager.startFactorio' })

    const { factorioExe } = store.get(`environments.list.${store.get('environments.active')}`).paths

    if (!factorioExe) {
      log.error('paths.factorioExe not in current environment, unable to start game', { namespace: 'main.app_manager.startFactorio' })
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
            cwd: factorioExe.slice(0, factorioExe.indexOf('factorio.exe')),
          }).unref()
          break
        case 'linux':
        case 'darwin':
          spawn(factorioExe).unref()
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
