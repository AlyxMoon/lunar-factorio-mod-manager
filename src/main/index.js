import { app, BrowserWindow } from 'electron'
import electronDebug from 'electron-debug'

import { productName } from '../../package.json'

app.setName(productName)
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

const isDev = process.env.NODE_ENV === 'development'
const appLock = app.requestSingleInstanceLock()
let mainWindow

if (!isDev) {
  if (appLock) {
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
} else {
  electronDebug({
    showDevTools: !(process.env.RENDERER_REMOTE_DEBUGGING === 'true'),
  })
}

app.on('ready', () => {
  createWindow(mainWindow)

  if (isDev) {
    installDevTools()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow(mainWindow)
  }
})

const createWindow = (window) => {
  window = new BrowserWindow({
    backgroundColor: '#fff',
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: false,
      webSecurity: false,
    },
    show: false,
  })

  window.removeMenu()

  if (isDev) {
    window.loadURL('http://localhost:9080')
  } else {
    window.loadFile(`${__dirname}/index.html`)

    global.__static = require('path')
      .join(__dirname, '/static')
      .replace(/\\/g, '\\\\')
  }

  window.on('ready-to-show', () => {
    window.show()
    window.focus()
  })

  window.on('closed', () => {
    console.log('closed window')
  })
}

const installDevTools = () => {
  try {
    require('devtron').install()
    require('vue-devtools').install()
  } catch (err) {
    console.error(err)
  }
}
