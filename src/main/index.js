import { app, BrowserWindow, screen } from 'electron'
import path from 'path'
import Store from 'electron-store'

import { productName } from '../../package'

import AppManager from './lib/app_manager'
import { debounce } from './lib/helpers'

const storeFile = new Store({
  defaults: {
    window: { },
  },
})

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
app.setName(productName)

let mainWindow
let appManager

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

const initializeApp = () => {
  appManager = new AppManager()
  appManager.init(mainWindow)
}

const createWindow = () => {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    minWidth: screenWidth / 2,
    minHeight: screenHeight / 1.25,
    width: storeFile.get('window.width', screenWidth / 2),
    height: storeFile.get('window.height', screenHeight / 2),
    x: storeFile.get('window.x', 0),
    y: storeFile.get('window.y', 0),

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
    storeFile.set({ window: { width, height } })
  }))

  mainWindow.on('move', debounce((event) => {
    const [x, y] = mainWindow.getPosition()
    storeFile.set({ window: { x, y } })
  }))
}

app.on('ready', () => {
  createWindow()
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
