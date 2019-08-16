import { app, BrowserWindow } from 'electron'
import path from 'path'
import { productName } from '../../package'

import AppManager from './lib/app_manager'

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
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
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
