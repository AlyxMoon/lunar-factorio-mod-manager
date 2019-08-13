import { app, BrowserWindow } from 'electron'
import { productName } from '../../package.json'

// set app name
app.setName(productName)

// disable electron warning
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

const isDev = process.env.NODE_ENV === 'development'
const appLock = app.requestSingleInstanceLock()
let mainWindow

// only allow single instance of application
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
  require('electron-debug')({
    showDevTools: !(process.env.RENDERER_REMOTE_DEBUGGING === 'true'),
  })
}

async function installDevTools () {
  try {
    require('devtron').install()
    require('vue-devtools').install()
  } catch (err) {
    console.error(err)
  }
}

function createWindow () {
  console.log('trying to createWindow?')
  mainWindow = new BrowserWindow({
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

  mainWindow.removeMenu()

  if (isDev) {
    mainWindow.loadURL('http://localhost:9080')
  } else {
    mainWindow.loadFile(`${__dirname}/index.html`)

    global.__static = require('path')
      .join(__dirname, '/static')
      .replace(/\\/g, '\\\\')
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', () => {
    console.log('closed window')
  })
}

app.on('ready', () => {
  createWindow()

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
    createWindow()
  }
})
