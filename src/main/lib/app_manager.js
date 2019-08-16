import fs from 'fs'
import path from 'path'
import os from 'os'
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

    this.configureEventListeners()
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
        paths.push(path.join(app.getPath('home'), '.factorio', 'bin', 'x64', 'factorio'))
        paths.push(path.join(app.getPath('home'), 'factorio', 'bin', 'i386', 'factorio'))

        break
      case 'darwin':
        // TODO Add MacOS X support
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
    const gamePath = await dialog.showOpenDialog(mainWindow, {
      title: 'Find location of Factorio binary file',
      properties: ['openFile'],
      filters: [{
        name: 'Factorio Executable',
        extensions: ['exe'],
      }],
    })

    console.log(gamePath)
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
        // TODO Add MacOS X support
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

  async startFactorio () {
    const factorioPath = store.get('paths.factorio')

    if (!factorioPath) {
      console.error('Do not have the path to Factorio file, unable to start the game')
      return
    }

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
    }
    this.closeApp()
  }

  async closeApp () {
    app.quit()
  }
}
