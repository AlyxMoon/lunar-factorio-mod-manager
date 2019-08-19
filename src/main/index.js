import { app, BrowserWindow, ipcMain, screen } from 'electron'
import path from 'path'

import store from './lib/store'
import { productName } from '../../package'

import AppManager from './lib/app_manager'
import ModManager from './lib/mod_manager'
import ProfileManager from './lib/profile_manager'
import { debounce } from '../shared/debounce'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
app.setName(productName)

let mainWindow
let appManager
let modManager
let profileManager

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

const addClientEventListeners = async () => {
  store.onDidChange('mods.installed', (newValue) => {
    mainWindow.webContents.send('INSTALLED_MODS', newValue)
  })

  store.onDidChange('profiles.list', (newValue) => {
    mainWindow.webContents.send('PROFILES_LIST', newValue)
  })

  store.onDidChange('profiles.active', (newValue) => {
    mainWindow.webContents.send('PROFILES_ACTIVE', newValue)
  })

  store.onDidChange('player.username', (newValue) => {
    mainWindow.webContents.send('PLAYER_USERNAME', newValue)
  })

  if (isDevMode) {
    // Normally won't need to call these events
    // but during development if renderer code is reloaded then the app won't send info again and that's annoying
    ipcMain.on('REQUEST_PLAYER_USERNAME', (event) => {
      event.reply('PLAYER_USERNAME', store.get('player.username'))
    })
    ipcMain.on('REQUEST_INSTALLED_MODS', (event) => {
      event.reply('INSTALLED_MODS', store.get('mods.installed'))
    })

    ipcMain.on('REQUEST_PROFILES', (event) => {
      event.reply('PROFILES_LIST', store.get('profiles.list'))
      event.reply('PROFILES_ACTIVE', store.get('profiles.active'))
    })
  }

  ipcMain.on('ADD_MOD_TO_CURRENT_PROFILE', (event, mod) => {
    profileManager.addModToCurrentProfile(mod)
  })

  ipcMain.on('REMOVE_MOD_FROM_CURRENT_PROFILE', (event, mod) => {
    profileManager.removeModFromCurrentProfile(mod)
  })

  ipcMain.on('ADD_PROFILE', (event) => {
    profileManager.addProfile()
  })

  ipcMain.on('UPDATE_CURRENT_PROFILE', (event, data) => {
    profileManager.updateCurrentProfile(data)
  })

  ipcMain.on('REMOVE_CURRENT_PROFILE', (event) => {
    profileManager.removeCurrentProfile()
  })
}

const initializeApp = async () => {
  await addClientEventListeners()

  appManager = new AppManager()
  await appManager.init(mainWindow)

  modManager = new ModManager()
  await modManager.retrieveListOfInstalledMods()

  profileManager = new ProfileManager()
  await profileManager.init()
  await profileManager.loadProfiles()

  mainWindow.webContents.send('PLAYER_USERNAME', store.get('player.username'))
  mainWindow.webContents.send('INSTALLED_MODS', store.get('mods.installed'))
  mainWindow.webContents.send('PROFILES_LIST', store.get('profiles.list'))
  mainWindow.webContents.send('PROFILES_ACTIVE', store.get('profiles.active'))
}

const createWindow = () => {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    minWidth: screenWidth / 2,
    minHeight: screenHeight / 1.25,
    width: store.get('window.width', screenWidth / 2),
    height: store.get('window.height', screenHeight / 2),
    x: store.get('window.x', 0),
    y: store.get('window.y', 0),

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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()

    initializeApp()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('resize', debounce((event) => {
    const [width, height] = mainWindow.getSize()
    store.set({ window: { width, height } })
  }))

  mainWindow.on('move', debounce((event) => {
    const [x, y] = mainWindow.getPosition()
    store.set({ window: { x, y } })
  }))
}

app.on('ready', async () => {
  await createWindow()

  if (isDevMode) {
    require('vue-devtools').install()
  }
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
