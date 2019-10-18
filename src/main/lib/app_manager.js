import fs from 'fs'
import path from 'path'
import os from 'os'
import { promisify } from 'util'
import { spawn } from 'child_process'
import { app, dialog, ipcMain } from 'electron'

import store from './store'

export default class AppManager {
  async init (mainWindow) {
    if (!store.get('paths.factorio')) {
      const thePath = await this.findFactorioPath(mainWindow)
      if (thePath) {
        store.set('paths.factorio', thePath)
      } else {
        console.error('Unable to find the factorio path!')
      }
    }

    if (!store.get('paths.mods')) {
      const thePath = await this.findFactorioModPath(mainWindow)
      if (thePath) {
        store.set('paths.mods', thePath)
      } else {
        console.error('Unable to find the mods path!')
      }
    }

    if (!store.get('paths.playerData')) {
      const thePath = await this.findFactorioPlayerData(mainWindow)
      if (thePath) {
        store.set('paths.playerData', thePath)
      } else {
        console.error('Unable to find the player-data.json path!')
      }
    }

    await this.retrievePlayerData(mainWindow)

    await this.configureEventListeners()
  }

  async configureEventListeners () {
    ipcMain.on('START_FACTORIO', () => {
      this.startFactorio()
    })
  }

  async findFactorioPath (mainWindow) {
    console.log(1, 'Attempting to find Factorio binary file.')

    const paths = []

    switch (os.platform()) {
      case 'win32':
        // ------------------------------
        // Guess for common file locations first - Windows
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
        // ------------------------------
        // Guess for common file locations first - Linux
        paths.push(path.join(app.getPath('home'), '.steam/steam/steamapps/common/Factorio/bin/x64/factorio'))
        paths.push(path.join(app.getPath('home'), '.steam/steam/steamapps/common/Factorio/bin/i386/factorio'))
        paths.push(path.join(app.getPath('home'), '.factorio', 'bin', 'x64', 'factorio'))
        paths.push(path.join(app.getPath('home'), 'factorio', 'bin', 'i386', 'factorio'))

        break
      case 'darwin':
        paths.push(path.join(app.getPath('home'), 'Library', 'Application Support', 'Steam', 'steamapps', 'common', 'Factorio', 'factorio.app', 'Contents', 'MacOS', 'factorio'))
        break
    }

    for (let i = 0, length = paths.length; i < length; i++) {
      try {
        fs.readFileSync(paths[i], 'utf8')
        console.log(1, `Found Factorio binary automatically: ${paths[i]}`)
        return paths[i]
      } catch (error) { if (error.code !== 'ENOENT') return undefined }
    }

    // ------------------------------
    // Prompt if file was not found automatically
    console.log(1, 'Could not find automatically, prompting user for file location.')

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

    if (gamePath && !gamePath.canceled) {
      return gamePath.filePaths[0]
    } else {
      return undefined
    }
  }

  async findFactorioModPath (mainWindow) {
    console.log(1, 'Attempting to find Factorio mods location.')

    const paths = []

    switch (os.platform()) {
      case 'win32':
        // ------------------------------
        // Guess for common file locations first - Windows
        paths.push(path.join(app.getPath('appData'), 'Factorio', 'mods', 'mod-list.json'))
        paths.push(path.join('C:\\', 'Program Files', 'Factorio', 'mods', 'mod-list.json'))
        paths.push(path.join('C:\\', 'Program Files (x86)', 'Factorio', 'mods', 'mod-list.json'))

        break
      case 'linux':
        // ------------------------------
        // Guess for common file locations first - Linux
        paths.push(path.join(app.getPath('home'), '.factorio', 'mods', 'mod-list.json'))
        paths.push(path.join(app.getPath('home'), 'factorio', 'mods', 'mod-list.json'))

        break
      case 'darwin':
        paths.push(path.join(app.getPath('home'), 'Library', 'Application Support', 'factorio', 'mods', 'mod-list.json'))
        break
    }

    for (let i = 0, length = paths.length; i < length; i++) {
      try {
        if (fs.existsSync(paths[i], 'utf8')) {
          console.log(1, `Found mods directory automatically: ${path.join(paths[i], '..')}`)
          return path.join(paths[i], '..')
        }
      } catch (error) { if (error.code !== 'ENOENT') return undefined }
    }

    // ------------------------------
    // Prompt if we didn't find anything
    const modlistPath = await dialog.showOpenDialog(mainWindow, {
      title: 'Find location of Factorio mods directory',
      properties: ['openDirectory'],
    })

    if (modlistPath && !modlistPath.canceled) {
      return modlistPath.filePaths[0]
    } else {
      return undefined
    }
  }

  async findFactorioPlayerData (mainWindow) {
    console.log(1, 'Attempting to find player-data.json file.')

    const paths = []

    switch (os.platform()) {
      case 'win32':
        // ------------------------------
        // Guess for common file locations first - Windows
        paths.push(path.join(app.getPath('appData'), 'Factorio', 'player-data.json'))
        paths.push(path.join(app.getPath('appData'), 'Factorio', 'config', 'player-data.json'))
        break
      case 'linux':
        // ------------------------------
        // Guess for common file locations first - Linux
        paths.push(path.join(app.getPath('home'), '.factorio', 'player-data.json'))
        paths.push(path.join(app.getPath('home'), 'factorio', 'player-data.json'))

        break
      case 'darwin':
        paths.push(path.join(app.getPath('home'), 'Library', 'Application Support', 'factorio', 'player-data.json'))
        break
    }

    for (let i = 0, length = paths.length; i < length; i++) {
      try {
        fs.readFileSync(paths[i], 'utf8')
        console.log(1, `Found player-data.json automatically: ${paths[i]}`)
        return paths[i]
      } catch (error) { if (error.code !== 'ENOENT') return undefined }
    }

    // ------------------------------
    // Prompt if we didn't find anything
    console.log(1, 'Could not find automatically, prompting user for file location.')
    const playerDataPath = await dialog.showOpenDialog(mainWindow, {
      title: 'Find location of player-data.json file',
      properties: ['openFile'],
      filters: [{
        name: 'Factorio Player Data',
        extensions: ['json'],
      }],
    })

    if (playerDataPath && !playerDataPath.canceled) {
      return playerDataPath.filePaths[0]
    } else {
      return undefined
    }
  }

  async retrievePlayerData (mainWindow) {
    const player = store.get('player')

    if (!player.username || !player.token) {
      const playerDataPath = store.get('paths.playerData')
      if (!playerDataPath) return console.error('Unable to retrieve Factorio user info as player-data.json file is not known')

      const data = JSON.parse(await promisify(fs.readFile)(playerDataPath, 'utf8'))
      if (!data['service-username'] || !data['service-token']) {
        mainWindow.webContents.send('ADD_TOAST', {
          type: 'warning',
          text: 'Unable to get user info from the player-data.json file. This is likely due to not having opened Factorio before. You will be unable to download online mods through this app.',
          dismissAfter: 12000,
        })
      } else {
        store.set('player.username', data['service-username'])
        store.set('player.token', data['service-token'])
      }
    }
  }

  async updateModListJSON () {
    console.log(1, 'Beginning to save current mod configuration.')
    const filePath = path.join(store.get('paths.mods'), 'mod-list.json')

    const currentProfile = store.get('profiles.list')[store.get('profiles.active')]
    const modListData = {
      mods: store.get('mods.installed').map(mod => ({
        name: mod.name,
        enabled: currentProfile.mods.some(m => m.name === mod.name),
      })),
    }

    fs.writeFileSync(filePath, JSON.stringify(modListData, null, 4))
    console.log(1, 'Finished saving current mod configuration.')
  }

  async startFactorio () {
    const factorioPath = store.get('paths.factorio')

    if (!factorioPath) {
      console.error('Do not have the path to Factorio file, unable to start the game')
      return
    }

    this.updateModListJSON()

    if (os.platform() === 'win32') {
      spawn('factorio.exe', [], {
        stdio: 'ignore',
        detached: true,
        cwd: factorioPath.slice(0, factorioPath.indexOf('factorio.exe')),
      }).unref()
    } else if (os.platform() === 'linux') {
      spawn(factorioPath).unref()
    } else if (os.platform() === 'darwin') {
      // TODO Add MacOS X support
      spawn(factorioPath).unref()
    }
    this.closeApp()
  }

  async closeApp () {
    app.quit()
  }
}
