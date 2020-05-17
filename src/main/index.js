import { app, dialog, BrowserWindow, ipcMain, screen } from 'electron'
import os from 'os'
import path from 'path'

import {
  config as store,
  onlineModsCache,
} from '@shared/store'
import AppManager from '@/lib/app_manager'
import ModManager from '@/lib/mod_manager'
import ProfileManager from '@/lib/profile_manager'
import DownloadManager from '@/lib/download_manager'
import SaveManager from '@/lib/save_manager'
import log from '@shared/logger'
import { debounce } from '@shared/util'

log.debug('App starting', { namespace: 'main.index' })
log.debug(`OS Platform: ${os.platform()}`, { namespace: 'main.index' })

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

let mainWindow
let appManager
let modManager
let profileManager
let downloadManager
let saveManager

const isDevMode = process.env.NODE_ENV === 'development'

if (app.requestSingleInstanceLock()) {
  app.on('second-instance', () => {
    if (mainWindow && mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.focus()
  })
} else {
  app.quit()
  process.exit(0)
}

const showErrorAndExit = (error, message) => {
  log.error(`Error occurred during initialization that would prevent app from running correctly`)
  log.error(error.stack)

  const selection = dialog.showMessageBoxSync({
    type: 'error',
    buttons: ['Close App', 'Restart App', 'Restart App (and wipe config)'],
    message: 'Error occurred during initialization that would prevent app from running correctly.',
    detail: `
      ${error.message}
      -----
      You can find the log files at: ${path.join(app.getPath('userData'), 'logs')}
      -----
      It's possible an incorrect configuration may have been set which is causing the issue. You can choose to wipe the app config as a potential fix.
    `.replace(/  +/g, ''),
  })

  if ([1, 2].includes(selection)) app.relaunch()

  if (selection === 2) {
    log.info('App configuration wiped during error exit.')
    store.clear()
  }

  app.exit(error.code)
}

const addClientEventListeners = async () => {
  ipcMain.on('PROMPT_NEW_FACTORIO_PATH', async (event, type) => {
    const path = await appManager.promptForPath(mainWindow, type)
    if (path) store.set(`paths.${type}`, path)
  })

  ipcMain.on('ADD_MOD_TO_CURRENT_PROFILE', (event, mod) => {
    profileManager.addModToProfile(mod)
  })

  ipcMain.on('REMOVE_MOD_FROM_CURRENT_PROFILE', (event, mod) => {
    profileManager.removeModFromCurrentProfile(mod)
  })

  ipcMain.on('ADD_PROFILE', ({ reply }, { name, mods } = {}) => {
    profileManager.addProfile({ name, mods })
  })

  ipcMain.handle('ADD_PROFILE', async ({ reply }, { name, mods } = {}) => {
    return profileManager.addProfile({ name, mods })
  })

  ipcMain.on('UPDATE_CURRENT_PROFILE', (event, data) => {
    profileManager.updateCurrentProfile(data)
  })

  ipcMain.on('REMOVE_CURRENT_PROFILE', (event) => {
    profileManager.removeCurrentProfile()
  })

  ipcMain.on('FETCH_ONLINE_MODS', (event, force) => {
    modManager.fetchOnlineMods(force)
  })

  ipcMain.handle('FETCH_ONLINE_MOD_DETAILED_INFO', (event, modName, force) => {
    return modManager.fetchOnlineModDetailedInfo(modName, force)
  })

  ipcMain.on('DOWNLOAD_MOD', (event, name, title, version, downloadUrl) => {
    downloadManager.addDownloadRequest(name, title, version, downloadUrl)
  })

  ipcMain.on('DELETE_MOD', (event, name) => {
    modManager.deleteMod(name)
  })

  ipcMain.handle('GET_APP_LATEST_VERSION', () => {
    return appManager.retrieveLatestAppVersion()
  })

  ipcMain.on('RETRIEVE_FACTORIO_SAVES', async (event) => {
    const saves = await saveManager.retrieveFactorioSaves()
    event.reply('FACTORIO_SAVES', saves)
  })

  ipcMain.on('UPDATE_OPTION', (event, { name, value }) => {
    store.set(`options.${name}`, value)
  })

  ipcMain.on('UPDATE_FACTORIO_PATH', (event, { name, value }) => {
    store.set(`paths.${name}`, value)
  })
}

const initializeApp = async () => {
  appManager = new AppManager()
  await appManager.init(mainWindow)

  if (!store.get('meta.firstRun')) {
    ipcMain.once('FINISH_FIRST_RUN', async () => {
      store.set('meta.firstRun', true)

      await initializeApp()
      mainWindow.webContents.send('CHANGE_PAGE', 'PageProfiles')
    })
    return
  }

  modManager = new ModManager()
  await modManager.retrieveListOfInstalledMods()

  profileManager = new ProfileManager()
  await profileManager.init()
  await profileManager.loadProfiles()

  downloadManager = new DownloadManager(mainWindow.webContents, modManager)

  saveManager = new SaveManager()

  mainWindow.webContents.session.on('will-download', (event, item) => downloadManager.manageDownload(item))

  mainWindow.webContents.send('PLAYER_USERNAME', store.get('player.username'))
  mainWindow.webContents.send('INSTALLED_MODS', store.get('mods.installed'))
  mainWindow.webContents.send('ONLINE_MODS', onlineModsCache.get('mods'))
  mainWindow.webContents.send('PROFILES_LIST', store.get('profiles.list'))
  mainWindow.webContents.send('PROFILES_ACTIVE', store.get('profiles.active'))
  mainWindow.webContents.send('APP_OPTIONS', store.get('options'))
  mainWindow.webContents.send('FACTORIO_PATHS', store.get('paths'))
}

const createWindow = () => {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize

  const { width, height, x, y } = store.get('window')

  mainWindow = new BrowserWindow({
    minWidth: screenWidth / 2,
    minHeight: screenHeight / 1.25,
    width: width || screenWidth / 2,
    height: height || screenHeight,
    x: x || 0,
    y: y || 0,

    show: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: false,
      webSecurity: false,
    },
  })

  mainWindow.removeMenu()

  if (isDevMode) {
    mainWindow.loadURL('http://localhost:9080')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'))
  }

  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\')

  mainWindow.on('ready-to-show', async () => {
    try {
      await initializeApp()
    } catch (error) {
      return showErrorAndExit(error, 'Error occurred during initialization that would prevent app from running correctly')
    }

    await addClientEventListeners()
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('resize', debounce((event) => {
    const [width, height] = mainWindow.getSize()
    store.set({
      'window.width': width,
      'window.height': height,
    })
  }))

  mainWindow.on('move', debounce((event) => {
    const [x, y] = mainWindow.getPosition()
    store.set({
      'window.x': x,
      'window.y': y,
    })
  }))
}

app.on('ready', async () => {
  await createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

process.on('uncaughtException', (error) => {
  log.error('An error occurred during the process that was not handled properly')
  log.error(error.stack)

  process.exit()
})
