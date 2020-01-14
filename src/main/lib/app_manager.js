import fs from 'fs'
import path from 'path'
import os from 'os'
import { promisify } from 'util'
import { spawn } from 'child_process'
import { app, dialog, ipcMain } from 'electron'
import fetch from 'node-fetch'

import store from '@lib/store'
import log from './logger'

export default class AppManager {
  async init (mainWindow) {
    log.debug('Entered function', { namespace: 'main.app_manager.init' })

    if (!store.get('paths.factorio')) {
      log.info('paths.factorio not found in config', { namespace: 'main.app_manager.init' })
      const thePath = await this.findFactorioPath(mainWindow)
      if (thePath) {
        log.info(`paths.factorio was retrieved, setting in config: ${thePath}`, { namespace: 'main.app_manager.init' })
        store.set('paths.factorio', thePath)
      } else {
        log.error('paths.factorio could not be retrieved', { namespace: 'main.app_manager.init' })
      }
    } else {
      log.info('Found paths.factorio in config', { namespace: 'main.app_manager.init' })
    }

    if (!store.get('paths.mods')) {
      log.info('paths.mods not found in config', { namespace: 'main.app_manager.init' })
      const thePath = await this.findFactorioModPath(mainWindow)
      if (thePath) {
        log.info(`paths.mods was retrieved, setting in config: ${thePath}`, { namespace: 'main.app_manager.init' })
        store.set('paths.mods', thePath)
      } else {
        log.error('paths.mods could not be retrieved', { namespace: 'main.app_manager.init' })
      }
    } else {
      log.info('Found paths.mods in config', { namespace: 'main.app_manager.init' })
    }

    if (!store.get('paths.saves')) {
      log.info('paths.saves not found in config', { namespace: 'main.app_manager.init' })
      const thePath = await this.findFactorioSavesPath(mainWindow)
      if (thePath) {
        log.info(`paths.saves was retrieved, setting in config: ${thePath}`, { namespace: 'main.app_manager.init' })
        store.set('paths.saves', thePath)
      } else {
        log.error('paths.saves could not be retrieved', { namespace: 'main.app_manager.init' })
      }
    } else {
      log.info('Found paths.saves in config', { namespace: 'main.app_manager.init' })
    }

    if (!store.get('paths.playerData')) {
      log.info('paths.playerData not found in config', { namespace: 'main.app_manager.init' })
      const thePath = await this.findFactorioPlayerData(mainWindow)
      if (thePath) {
        log.info(`paths.playerData was retrieved, setting in config: ${thePath}`, { namespace: 'main.app_manager.init' })
        store.set('paths.playerData', thePath)
      } else {
        log.error('paths.playerData could not be retrieved', { namespace: 'main.app_manager.init' })
      }
    } else {
      log.info('Found paths.playerData in config', { namespace: 'main.app_manager.init' })
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

  async findFactorioPath (mainWindow) {
    log.debug('Entering function', { namespace: 'main.app_manager.findFactorioPath' })

    // Compile a list of what I guess are common paths
    const paths = []
    switch (os.platform()) {
      case 'win32':
        paths.push(path.join('C:\\', 'Program Files', 'Factorio', 'bin', 'Win32', 'factorio.exe'))
        paths.push(path.join('C:\\', 'Program Files', 'Factorio', 'bin', 'x64', 'factorio.exe'))
        paths.push(path.join('C:\\', 'Program Files (x86)', 'Factorio', 'bin', 'Win32', 'factorio.exe'))
        paths.push(path.join('C:\\', 'Program Files (x86)', 'Factorio', 'bin', 'x64', 'factorio.exe'))
        paths.push(path.join('C:\\', 'Program Files', 'Steam', 'SteamApps', 'common', 'Factorio', 'bin', 'Win32', 'factorio.exe'))
        paths.push(path.join('C:\\', 'Program Files', 'Steam', 'SteamApps', 'common', 'Factorio', 'bin', 'x64', 'factorio.exe'))
        paths.push(path.join('C:\\', 'Program Files (x86)', 'Steam', 'SteamApps', 'common', 'Factorio', 'bin', 'Win32', 'factorio.exe'))
        paths.push(path.join('C:\\', 'Program Files (x86)', 'Steam', 'SteamApps', 'common', 'Factorio', 'bin', 'x64', 'factorio.exe'))
        break
      case 'linux':
        paths.push(path.join(app.getPath('home'), '.steam/steam/steamapps/common/Factorio/bin/x64/factorio'))
        paths.push(path.join(app.getPath('home'), '.steam/steam/steamapps/common/Factorio/bin/i386/factorio'))
        paths.push(path.join(app.getPath('home'), '.factorio', 'bin', 'x64', 'factorio'))
        paths.push(path.join(app.getPath('home'), 'factorio', 'bin', 'i386', 'factorio'))
        break
      case 'darwin':
        paths.push(path.join(app.getPath('home'), 'Library', 'Application Support', 'Steam', 'steamapps', 'common', 'Factorio', 'factorio.app', 'Contents', 'MacOS', 'factorio'))
        break
    }

    log.debug('Starting loop to automatically find paths.factorio', { namespace: 'main.app_manager.findFactorioPath' })
    for (let i = 0, length = paths.length; i < length; i++) {
      try {
        if (fs.existsSync) {
          log.info('paths.factorio found with automatic search', { namespace: 'main.app_manager.findFactorioPath' })
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

    // ------------------------------
    // Prompt if file was not found automatically

    const extensions = []
    if (os.platform() === 'win32') extensions.push('exe')
    if (os.platform() === 'linux') extensions.push('*')
    if (os.platform() === 'darwin') extensions.push('app')

    const gamePath = await dialog.showOpenDialog(mainWindow, {
      title: 'Find location of Factorio binary file',
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
        log.info('paths.factorio found with user prompt', { namespace: 'main.app_manager.findFactorioPath' })
        log.debug(`Exiting function, retval: ${gamePath.filePaths[0]}`, { namespace: 'main.app_manager.findFactorioPath' })
        return gamePath.filePaths[0]
      }
    }

    log.debug(`Exiting function`, { namespace: 'main.app_manager.findFactorioPath' })
  }

  async findFactorioModPath (mainWindow) {
    log.debug('Entering function', { namespace: 'main.app_manager.findFactorioModPath' })

    // Compile a list of what I guess are common paths
    const paths = []
    switch (os.platform()) {
      case 'win32':
        paths.push(path.join(app.getPath('appData'), 'Factorio', 'mods', 'mod-list.json'))
        paths.push(path.join('C:\\', 'Program Files', 'Factorio', 'mods', 'mod-list.json'))
        paths.push(path.join('C:\\', 'Program Files (x86)', 'Factorio', 'mods', 'mod-list.json'))
        break
      case 'linux':
        paths.push(path.join(app.getPath('home'), '.factorio', 'mods', 'mod-list.json'))
        paths.push(path.join(app.getPath('home'), 'factorio', 'mods', 'mod-list.json'))
        break
      case 'darwin':
        paths.push(path.join(app.getPath('home'), 'Library', 'Application Support', 'factorio', 'mods', 'mod-list.json'))
        break
    }

    for (let i = 0, length = paths.length; i < length; i++) {
      try {
        if (fs.existsSync(paths[i])) {
          log.info('paths.mods found with automatic search', { namespace: 'main.app_manager.findFactorioModPath' })
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
        log.info('paths.mods found with user prompt', { namespace: 'main.app_manager.findFactorioModPath' })
        log.debug(`Exiting function, retval: ${modlistPath.filePaths[0]}`, { namespace: 'main.app_manager.findFactorioModPath' })
        return modlistPath.filePaths[0]
      }
    }

    log.debug(`Exiting function`, { namespace: 'main.app_manager.findFactorioModPath' })
  }

  async findFactorioSavesPath (mainWindow) {
    log.debug('Entering function', { namespace: 'main.app_manager.findFactorioSavesPath' })

    // Compile a list of what I guess are common paths
    const paths = []
    switch (os.platform()) {
      case 'win32':
        paths.push(
          path.join(app.getPath('appData'), 'Factorio/saves'),
          path.join('C:\\', 'Program Files/Factorio/saves'),
          path.join('C:\\', 'Program Files (x86)/Factorio/saves'),
        )
        break
      case 'linux':
        paths.push(
          path.join(app.getPath('home'), '.factorio/saves'),
          path.join(app.getPath('home'), 'factorio/saves'),
        )
        break
      case 'darwin':
        paths.push(
          path.join(app.getPath('home'), 'Library/Application Support/factorio/saves'),
        )
        break
    }

    for (let i = 0, length = paths.length; i < length; i++) {
      try {
        if (fs.existsSync(paths[i])) {
          log.info('paths.saves found with automatic search', { namespace: 'main.app_manager.findFactorioSavesPath' })
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
        log.info('paths.saves found with user prompt', { namespace: 'main.app_manager.findFactorioSavesPath' })
        log.debug(`Exiting function, retval: ${filePaths[0]}`, { namespace: 'main.app_manager.findFactorioSavesPath' })
        return filePaths[0]
      }
    }

    log.debug(`Exiting function`, { namespace: 'main.app_manager.findFactorioSavesPath' })
  }

  async findFactorioPlayerData (mainWindow) {
    log.debug(`Entering function`, { namespace: 'main.app_manager.findFactorioPlayerData' })

    // Compile a list of what I guess are common paths
    const paths = []
    switch (os.platform()) {
      case 'win32':
        paths.push(path.join(app.getPath('appData'), 'Factorio', 'player-data.json'))
        paths.push(path.join(app.getPath('appData'), 'Factorio', 'config', 'player-data.json'))
        break
      case 'linux':
        paths.push(path.join(app.getPath('home'), '.factorio', 'player-data.json'))
        paths.push(path.join(app.getPath('home'), 'factorio', 'player-data.json'))
        break
      case 'darwin':
        paths.push(path.join(app.getPath('home'), 'Library', 'Application Support', 'factorio', 'player-data.json'))
        break
    }

    for (let i = 0, length = paths.length; i < length; i++) {
      try {
        if (fs.existsSync) {
          log.info('paths.playerData found with automatic search', { namespace: 'main.app_manager.findFactorioPlayerData' })
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
        log.info('paths.playerData found with user prompt', { namespace: 'main.app_manager.findFactorioPlayerData' })
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

      const playerDataPath = store.get('paths.playerData')
      if (!playerDataPath) {
        log.error('Unable to retrieve player data, paths.playerData not set', { namespace: 'main.app_manager.retrievePlayerData' })
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
      fs.writeFileSync(path.join(store.get('paths.mods'), 'mod-list.json'), modListData)
      log.info('Successfully updated mod-list.json file', { namespace: 'main.app_manager.updateModListJSON' })
    } catch (error) {
      log.error(`${error.code} ${error.message}`, { namespace: 'main.app_manager.updateModListJSON' })
    }

    log.profile('TIME updateModListJSON')
    log.debug(`Exiting function`, { namespace: 'main.app_manager.updateModListJSON' })
  }

  async startFactorio () {
    log.debug(`Entering function`, { namespace: 'main.app_manager.startFactorio' })

    const factorioPath = store.get('paths.factorio')
    if (!factorioPath) {
      log.error('paths.factorio not in config, unable to start game', { namespace: 'main.app_manager.startFactorio' })
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

    this.closeApp()

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
