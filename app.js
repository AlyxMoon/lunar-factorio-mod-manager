// ---------------------------------------------------------
// Global Variable Declarations
const path = require('path')
const fs = require('fs')

const electron = require('electron')
const app = electron.app
const appMessager = electron.ipcMain

const AppManager = require('./lib/appManager.js')
const ModManager = require('./lib/modManager.js')
const ProfileManager = require('./lib/profileManager.js')
const logger = require('./lib/logger.js')

let appManager
let mainWindow
let profileManager
let modManager
// ---------------------------------------------------------
// ---------------------------------------------------------
// Event listeners for application-related messages

app.on('ready', init)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    appManager.closeProgram(app, profileManager)
  }
})
app.on('activate', function () {
  if (mainWindow === null) {
    mainWindow = appManager.createWindow()
  }
})

// ---------------------------------------------------------
// ---------------------------------------------------------
// Event listeners for client messages

// ------------------------------
// Handled by AppManager
appMessager.on('requestAppConfig', function (event) {
  logger.log(0, 'Event called: requestAppConfig')
  event.sender.send('dataAppConfig', appManager.getAppConfig())
})

appMessager.on('requestAppVersionInfo', function (event) {
  logger.log(0, 'Event called: requestAppVersionInfo')

  let currentVersion = appManager.getCurrentAppVersion()
  let latestVersion = appManager.getLatestAppVersion()
  let versionLink = appManager.getLatestAppVersionLink()

  event.sender.send('dataAppVersionInfo', currentVersion, latestVersion, versionLink)
})

appMessager.on('startGame', function (event) {
  try {
    appManager.startGame(app, profileManager)
  } catch (error) {
    logger.log(4, `Error when starting Factorio: ${error}`)
    app.exit(-1)
  }
})

appMessager.on('updateConfig', function (event, data) {
  appManager.config = data
})

// ------------------------------
// Handled by ProfileManager
appMessager.on('requestAllProfiles', function (event) {
  logger.log(0, 'Event called: requestAllProfiles')
  event.sender.send('dataAllProfiles', profileManager.getAllProfiles())
})

appMessager.on('requestActiveProfile', function (event) {
  logger.log(0, 'Event called: requestActiveProfile')
  event.sender.send('dataActiveProfile', profileManager.getActiveProfile())
})

appMessager.on('newProfile', function (event) {
  try {
    profileManager.createProfile(modManager.getInstalledModNames())
    event.sender.send('dataAllProfiles', profileManager.getAllProfiles())
  } catch (error) {
    logger.log(4, `Error when creating new profile: ${error}`)
    app.exit(-1)
  }
})

appMessager.on('activateProfile', function (event, index) {
  try {
    profileManager.activateProfile(index)
  } catch (error) {
    logger.log(4, `Error when activating a profile: ${error}`)
    app.exit(-1)
  }
})

appMessager.on('renameProfile', function (event, index, newName) {
  try {
    profileManager.renameProfile(index, newName)
    event.sender.send('dataAllProfiles', profileManager.getAllProfiles())
    event.sender.send('dataActiveProfile', profileManager.getActiveProfile())
  } catch (error) {
    logger.log(4, `Error when renaming a profile: ${error}`)
    app.exit(-1)
  }
})

appMessager.on('deleteProfile', function (event, index) {
  try {
    profileManager.deleteProfile(index, modManager.getInstalledModNames())
    event.sender.send('dataAllProfiles', profileManager.getAllProfiles())
    event.sender.send('dataActiveProfile', profileManager.getActiveProfile())
  } catch (error) {
    logger.log(4, `Error when deleting a profile: ${error}`)
    app.exit(-1)
  }
})

appMessager.on('sortProfile', function (event, index, direction) {
  try {
    profileManager.moveProfile(index, direction)
    event.sender.send('dataAllProfiles', profileManager.getAllProfiles())
  } catch (error) {
    logger.log(4, `Error when sorting a profile: ${error}`)
    app.exit(-1)
  }
})

appMessager.on('toggleMod', function (event, profileIndex, modIndex) {
  try {
    profileManager.toggleMod(profileIndex, modIndex)
  } catch (error) {
    logger.log(4, `Error when togging a mod: ${error}`)
    app.exit(-1)
  }
})

// ------------------------------
// Handled by ModManager
appMessager.on('requestInstalledMods', function (event) {
  logger.log(0, 'Event called: requestInstalledMods')
  if (modManager) event.sender.send('dataInstalledMods', modManager.getInstalledMods())
})

appMessager.on('requestOnlineMods', function (event) {
  logger.log(0, 'Event called: requestOnlineMods')
  if (modManager) event.sender.send('dataOnlineMods', modManager.getOnlineMods())
})

appMessager.on('requestModFetchStatus', function (event) {
  logger.log(0, 'Event called: requestModFetchStatus')
  if (modManager) event.sender.send('dataModFetchStatus', modManager.areOnlineModsFetched(), modManager.getOnlineModFetchedCount(), modManager.getOnlineModCount())
})

appMessager.on('requestPlayerInfo', function (event) {
  logger.log(0, 'Event called: requestPlayerInfo')
  if (modManager) event.sender.send('dataPlayerInfo', modManager.getPlayerUsername())
})

appMessager.on('requestFactorioVersion', function (event) {
  logger.log(0, 'Event called: requestFactorioVersion')
  if (modManager) event.sender.send('dataFactorioVersion', modManager.getFactorioVersion())
})

appMessager.on('requestDownload', function (event, modName, downloadLink) {
  try {
    manageModDownload(modName, downloadLink)
  } catch (error) {
    logger.log(4, `Error when downloading a mod: ${error}`)
  }
})

appMessager.on('deleteMod', function (event, index) {
  modManager.deleteMod(index, function () {
    event.sender.send('dataInstalledMods', modManager.getInstalledMods())
    profileManager.removeDeletedMods(modManager.getInstalledModNames())
  })
})

// ---------------------------------------------------------
// ---------------------------------------------------------
// Application management functions

function init () {
  let screenSize = electron.screen.getPrimaryDisplay().workAreaSize

  try {
    appManager = new AppManager()
  } catch (error) {
    logger.log(4, `Error initializating App Manager. Error: ${error.message}`)
    app.exit(-1)
  }

  appManager.loadConfig(electron, screenSize.width, screenSize.height).then((config) => {
    if (!config) app.exit(-1)

    try {
      let baseModPath = path.join(config.game_path, '..', '..', '..', 'data', 'base')
      modManager = new ModManager(config.modlist_path, config.mod_directory_path, baseModPath, config.player_data_path)
    } catch (error) {
      logger.log(4, `Error creating Mod Manager class. Error: ${error.stack}`)
      app.exit(-1)
    }

    modManager.loadInstalledMods((err) => {
      if (err) {
        logger.log(4, 'Error when loading installed mods')
        app.exit(-1)
      }

      logger.log(1, 'Installed mods are loaded.')
      try {
        profileManager = new ProfileManager(config.modlist_path)
      } catch (error) {
        logger.log(4, `Error creating Profile Manager class. Error: ${error.message}`)
        app.exit(-1)
      }

      profileManager.loadProfiles().then((data) => {
        try {
          mainWindow = appManager.createWindow(screenSize.width, screenSize.height)
        } catch (error) {
          logger.log(4, `Error creating the window. Error: ${error.message}`)
          app.exit(-1)
        }

        mainWindow.on('resize', function (event) {
          let newSize = mainWindow.getSize()
          appManager.config.width = newSize[0]
          appManager.config.height = newSize[1]
        })
        mainWindow.on('move', function (event) {
          let newLoc = mainWindow.getPosition()
          appManager.config.x_loc = newLoc[0]
          appManager.config.y_loc = newLoc[1]
        })

        profileManager.updateProfilesWithNewMods(modManager.getInstalledModNames())
        profileManager.removeDeletedMods(modManager.getInstalledModNames())
        mainWindow.loadURL(`file://${__dirname}/view/index.html`)
      }).catch((error) => {
        logger.log(4, `Unhandled error saving profileManager config file. Error: ${error}`)
      })
    })

    modManager.loadPlayerData()
    modManager.fetchOnlineMods()
  }).catch((error) => {
    logger.log(4, `Unhandled error saving appManager config file. Error: ${error}`)
  })
}

function manageModDownload (modName, downloadLink) {
  logger.log(1, `Attempting to download mod: ${modName}`)
  modManager.getDownloadInfo(modName, downloadLink, (error, fullLink, modIndex) => {
    if (error) logger.log(2, 'Error attempting to download a mod', error)

    if (fullLink) {
      mainWindow.webContents.session.once('will-download', (event, item, webContents) => {
        item.setSavePath(`${modManager.getModDirectoryPath()}/${item.getFilename()}`)

        item.once('done', (event, state) => {
          if (state === 'completed') {
            logger.log(1, `Downloaded mod ${modName} successfully`)
            webContents.send('dataModDownloadStatus', 'finished')

            if (modIndex !== undefined) {
              let mod = modManager.getInstalledMods()[modIndex]
              fs.unlinkSync(`${modManager.getModDirectoryPath()}/${mod.name}_${mod.version}.zip`)
              logger.log(1, 'Deleted mod at: ' + `${modManager.getModDirectoryPath()}/${mod.name}_v${mod.version}.zip`)
            }

            modManager.loadInstalledMods(() => {
              profileManager.updateProfilesWithNewMods(modManager.getInstalledModNames())
              webContents.send('dataAllProfiles', profileManager.getAllProfiles())
              webContents.send('dataActiveProfile', profileManager.getActiveProfile())
              webContents.send('dataInstalledMods', modManager.getInstalledMods())
            })
          } else {
            logger.log(2, `Download failed: ${state}`)
          }
        })
      })

      mainWindow.webContents.send('dataModDownloadStatus', 'starting', modName)
      mainWindow.webContents.downloadURL(fullLink)
    }
  })
}
