const fs = require('fs')
const path = require('path')
const request = require('request')
const spawn = require('child_process').spawn
const os = require('os')
const storage = require('electron-json-storage')

const BrowserWindow = require('electron').BrowserWindow

const logger = require('./logger.js')

module.exports = AppManager
// ---------------------------------------------------------
// Primary class declaration

function AppManager() {
  this.config = null

  this.appVersion = this.loadAppMetaInfo().version
  this.latestVersion = null
  this.latestVersionLink = null
  this.latestVersionDownloadURL = null

  this.fetchLatestAppInfo()
}

// ---------------------------------------------------------
// Getters / Setters
AppManager.prototype.getAppConfig = function() {
  logger.log(0, `AppManager.getAppConfig() called, return:`, this.config)
  return this.config
}

AppManager.prototype.getCurrentAppVersion = function() {
  logger.log(0, `AppManager.getCurrentAppVersion() called, return: ${this.appVersion}`)
  return this.appVersion
}

AppManager.prototype.getLatestAppVersion = function() {
  logger.log(0, `AppManager.getLatestAppVersion() called, return: ${this.latestVersion}`)
  return this.latestVersion
}

AppManager.prototype.getLatestAppVersionLink = function() {
  logger.log(0, `AppManager.getLatestAppVersionLink() called, return: ${this.latestVersionLink}`)
  return this.latestVersionLink
}
// ---------------------------------------------------------
// File-Management

AppManager.prototype.saveConfig = function() {
  return new Promise((resolve, reject) => {
    storage.set('appManager', this.config, (error) => {
      if (error) {
        reject(error)
      } else {
        logger.log(1, `Saved appManager config file`)
        resolve()
      }
    })
    logger.log(1, 'Saved application configuration.')
  })
}

AppManager.prototype.loadConfig = function(electronDialog, screenWidth, screenHeight) {
  return new Promise((resolve, reject) => {
    let data

    // ------------------------------
    // Attempt to load config file

    storage.get('appManager', (error, file) => {
      if (error){
        reject(error)
      }

      try {
        // If the config file is empty, build a new one
        if (Object.keys(file).length === 0 && file.constructor === Object) {
          return this.buildConfigFile(electronDialog, screenWidth, screenHeight)
        } else {
          data = file

          if (!data.hasOwnProperty('width') || typeof data.width !== 'number') {
            // The value of this property isn't critical, nothing excessive needed
            logger.log(2, 'width not found parsing config, setting a default value and continuing.')
            data.width = 0
          }
          if (!data.hasOwnProperty('height') || typeof data.height !== 'number') {
            // The value of this property isn't critical, nothing excessive needed
            logger.log(2, 'height not found parsing config, setting a default value and continuing.')
            data.height = 0
          }
          if (data.width < (screenWidth / 2))
            data.width = screenWidth / 2
          if (data.height < (screenHeight / 1.25))
            data.height = screenHeight / 1.25

          if (!data.hasOwnProperty('x_loc') || typeof data.x_loc !== 'number') {
            // The value of this property isn't critical, nothing excessive needed
            logger.log(2, 'x_loc not found parsing config, setting a default value and continuing.')
            data.x_loc = 0
          }
          if (!data.hasOwnProperty('y_loc') || typeof data.y_loc !== 'number') {
            // The value of this property isn't critical, nothing excessive needed
            logger.log(2, 'y_loc not found parsing config, setting a default value and continuing.')
            data.y_loc = 0
          }

          if (!data.hasOwnProperty('mod_directory_path') || typeof data.mod_directory_path !== 'string') {
            // Give some backward compatibility. Remove in about a month, ~ October 1st
            if (data.hasOwnProperty('mod-path') || typeof data['mod-path'] === 'string') {
              data.mod_directory_path = data['mod-path'].slice()
              delete data['mod-path']
            } else {
              // Critical, can't fudge this one if not there
              logger.log(3, 'mod_directory_path not in config file, rebuilding config file.')
              return this.buildConfigFile(electronDialog, screenWidth, screenHeight)
            }
          }
          if (!data.hasOwnProperty('modlist_path') || typeof data.modlist_path !== 'string') {
            // Give some backward compatibility. Remove in about a month, ~ October 1st
            if (data.hasOwnProperty('modlist-path') || typeof data['modlist-path'] === 'string') {
              data.modlist_path = data['modlist-path'].slice()
              delete data['modlist-path']
            } else {
              // Critical, can't fudge this one if not there
              logger.log(3, 'modlist_path not in config file, rebuilding config file.')
              return this.buildConfigFile(electronDialog, screenWidth, screenHeight)
            }
          }
          if (!data.hasOwnProperty('game_path') || typeof data.game_path !== 'string') {
            // Give some backward compatibility. Remove in about a month, ~ October 1st
            if (data.hasOwnProperty('game-path') || typeof data['game-path'] === 'string') {
              data.game_path = data['game-path'].slice()
              delete data['game-path']
            } else {
              // Critical, can't fudge this one if not there
              logger.log(3, 'game_path not in config file, rebuilding config file.')
              return this.buildConfigFile(electronDialog, screenWidth, screenHeight)
            }
          }
          if (!data.hasOwnProperty('player_data_path') || typeof data.player_data_path !== 'string') {
            // Critical, can't fudge this one if not there
            logger.log(3, 'player_data_path not in config file, rebuilding config file.')
            return this.buildConfigFile(electronDialog, screenWidth, screenHeight)
          }

          logger.log(1, `appManager config loaded: ${JSON.stringify(data)}`)

          this.config = data
          resolve(this.config)
        }
      } catch (error) {
        logger.log(4, `Error: cannot load appManager config! ${error} (${JSON.stringify(file)})`)
        return this.buildConfigFile(electronDialog, screenWidth, screenHeight)
      }
    })
  })
}

AppManager.prototype.buildConfigFile = function(electron, screenWidth, screenHeight) {
  return new Promise((resolve, reject) => {
    // ------------------------------
    // Check data for integrity
    if (screenWidth === undefined || typeof screenWidth !== 'number' || screenWidth <= 0) {
      // Guess for a lower resolution
      logger.log(2, 'screenWidth not provided to buildConfigFile, setting to a default and continuing to build.')
      screenWidth = 1280
    }
    if (screenHeight === undefined || typeof screenHeight !== 'number' || screenHeight <= 0) {
      // Guess for a lower resolution
      logger.log(2, 'screenHeight not provided to buildConfigFile, setting to a default and continuing to build.')
      screenHeight = 720
    }

    let modListPath = this.promptForModlist(electron)
    if (modListPath === undefined) {
      logger.log(4, 'User cancelled the dialog search.')
      return null
    } else if (modListPath.indexOf('mod-list.json') === -1) {
      logger.log(4, `The selected file was not correct. Closing app. File: ${modListPath}`)
      return null
    }
    let modDirectoryPath = modListPath.slice(0, modListPath.indexOf('mod-list.json'))

    let gamePath = this.promptForGamePath(electron)
    if (gamePath === undefined) {
      logger.log(4, 'User cancelled the dialog search.')
      return null
    } else if (gamePath.indexOf('factorio') === -1) {
      logger.log(4, `The selected file was not correct. Closing app. File: ${gamePath}`)
      return null
    }

    let playerDataPath = this.promptForPlayerDataPath(electron)
    if (playerDataPath === undefined) {
      logger.log(4, 'User cancelled the dialog search.')
      return null
    } else if (playerDataPath.indexOf('player-data.json') === -1) {
      logger.log(4, `The selected file was not correct. Closing app. File: ${playerDataPath}`)
      return null
    }

    let data = {
      'minWidth': screenWidth / 2,
      'minHeight': screenHeight / 1.25,
      'width': screenWidth / 2,
      'height': screenHeight,
      'x_loc': 0,
      'y_loc': 0,
      'mod_directory_path': modDirectoryPath,
      'modlist_path': modListPath,
      'game_path': gamePath,
      'player_data_path': playerDataPath
    }

    storage.set('appManager', data, (error) => {
      if (error) {
        reject(error)
      } else {
        logger.log(1, `Saved appManager config file`)
        return this.loadConfig(electron, screenWidth, screenHeight)
      }
    })
  })
}

AppManager.prototype.loadAppMetaInfo = function() {
  let filePath = path.join(__dirname, '..', 'package.json')

  try {
    let data = fs.readFileSync(filePath, 'utf8')
    data = JSON.parse(data)
    return data
  } catch (error) {
    logger.log(4, `Unhandled error loading package.json file. Error: ${error.message}`)
    return null
  }
}

// ---------------------------------------------------------
// Online calls

AppManager.prototype.fetchLatestAppInfo = function() {
  let options = {
    'url': 'https://api.github.com/repos/AlyxMoon/lunars-factorio-mod-manager/releases/latest',
    'headers': {
      'User-Agent': 'request'
    }
  }

  request(options, (error, response, data) => {
    if (!error && response.statusCode === 200) {
      data = JSON.parse(data)
      this.latestVersion = data.tag_name.slice(1) // Cut off the v at beginning
      this.latestVersionLink = data.html_url
      this.latestVersionDownloadURL = data.assets[0].browser_download_url
    } else {
      if (error)
        logger.log(3, `Error fetching latest app version. Error: ${error.message}`)
      if (response)
        logger.log(3, `Error fetching latest app version. Response: ${response.statusCode}`)
    }
  })
}

// ---------------------------------------------------------
// Startup-related functions

AppManager.prototype.promptForModlist = function(electron) {
  logger.log(1, 'Attempting to find Factorio mod list.')

  let paths = []

  switch (os.platform()) {
    case 'win32':
      // ------------------------------
      // Guess for common file locations first - Windows
      paths.push(path.join(electron.app.getPath('appData'), 'Factorio', 'mods', 'mod-list.json'))
      paths.push(path.join('C:\\', 'Program Files', 'Factorio', 'mods', 'mod-list.json'))
      paths.push(path.join('C:\\', 'Program Files (x86)', 'Factorio', 'mods', 'mod-list.json'))
      break;
    case 'linux':
      // ------------------------------
      // Guess for common file locations first - Linux
      paths.push(path.join(electron.app.getPath('home'), '.factorio', 'mods', 'mod-list.json'))
      paths.push(path.join(electron.app.getPath('home'), 'factorio', 'mods', 'mod-list.json'))
      break;
    case 'darwin':
      //TODO Add MacOS X support
      break;
  }

  for (let i = 0, length = paths.length; i < length; i++) {
    try {
      fs.readFileSync(paths[i], 'utf8')
      logger.log(1, `Found mod-list.json automatically: ${paths[i]}`)
      return paths[i]
    } catch (error) {
      if (error.code !== 'ENOENT')
        return undefined
    }
  }

  // ------------------------------
  // Prompt if we didn't find anything
  logger.log(1, 'Could not find automatically, prompting user for file location.')
  let options = {
    'title': 'Find location of mod-list.json file',
    'properties': ['openFile'],
    'filters': [{
      'name': 'Factorio Mod List',
      'extensions': ['json']
    }]
  }

  let modlistPath = electron.dialog.showOpenDialog(options)

  if (modlistPath)
    return modlistPath[0]
  else
    return undefined
}

AppManager.prototype.promptForGamePath = function(electron) {
  logger.log(1, 'Attempting to find Factorio binary file.')

  let paths = []

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
      break;
    case 'linux':
      // ------------------------------
      // Guess for common file locations first - Linux
      paths.push(path.join(electron.app.getPath('home'), '.factorio', 'bin', 'x64', 'factorio'))
      paths.push(path.join(electron.app.getPath('home'), 'factorio', 'bin', 'i386', 'factorio'))
      break;
    case 'darwin':
      //TODO Add MacOS X support
      break;
  }

  for (let i = 0, length = paths.length; i < length; i++) {
    try {
      fs.readFileSync(paths[i], 'utf8')
      logger.log(1, `Found Factorio binary automatically: ${paths[i]}`)
      return paths[i]
    } catch (error) {
      if (error.code !== 'ENOENT')
        return undefined
    }
  }

  // ------------------------------
  // Prompt if we didn't find anything
  logger.log(1, 'Could not find automatically, prompting user for file location.')
  let options = {
    'title': 'Find location of Factorio binary file',
    'properties': ['openFile'],
    'filters': [{
      'name': 'Factorio Executable'
    }]
  }

  let gamePath = electron.dialog.showOpenDialog(options)

  if (gamePath)
    return gamePath[0]
  else
    return undefined
}

AppManager.prototype.promptForPlayerDataPath = function(electron) {
  logger.log(1, 'Attempting to find player-data.json file.')

  let paths = []

  switch (os.platform()) {
    case 'win32':
      // ------------------------------
      // Guess for common file locations first - Windows
      paths.push(path.join(electron.app.getPath('appData'), 'Factorio', 'player-data.json'))
      paths.push(path.join(electron.app.getPath('appData'), 'Factorio', 'config', 'player-data.json'))
      break;
    case 'linux':
      // ------------------------------
      // Guess for common file locations first - Linux
      paths.push(path.join(electron.app.getPath('home'), '.factorio', 'player-data.json'))
      paths.push(path.join(electron.app.getPath('home'), 'factorio', 'player-data.json'))
      break;
    case 'darwin':
      //TODO Add MacOS X support
      break;
  }

  for (let i = 0, length = paths.length; i < length; i++) {
    try {
      fs.readFileSync(paths[i], 'utf8')
      logger.log(1, `Found player-data.json automatically: ${paths[i]}`)
      return paths[i]
    } catch (error) {
      if (error.code !== 'ENOENT')
        return undefined
    }
  }

  // ------------------------------
  // Prompt if we didn't find anything
  let options = {
    'title': 'Find location of player-data.json file',
    'properties': ['openFile'],
    'filters': [{
      'name': 'Factorio Player Data',
      'extensions': ['json']
    }]
  }

  let gamePath = electron.dialog.showOpenDialog(options)

  if (gamePath)
    return gamePath[0]
  else
    return undefined
}

// ---------------------------------------------------------
// Application-finishing functions

AppManager.prototype.startGame = function(app, profileManager) {
  logger.log(1, 'Starting Factorio and shutting down app.')

  profileManager.updateFactorioModlist()
  if (os.platform() === 'win32') {
    let factorioPath = this.config.game_path.slice(0, this.config.game_path.indexOf('factorio.exe'))
    spawn('factorio.exe', [], {
      'stdio': 'ignore',
      'detached': true,
      'cwd': factorioPath
    }).unref()
  } else if (os.platform() === 'linux') {
    spawn(this.config.game_path).unref();
  } else if (os.platform() === 'darwin') {
    //TODO Add MacOS X support
  }
  this.closeProgram(app, profileManager)
}

AppManager.prototype.closeProgram = function(app, profileManager, inError = false) {
  if (inError) {
    logger.log(1, 'There was an error. Not saving app data, closing app.')
    app.exit(-1)
  } else {
    logger.log(1, 'Beginning application shutdown.')
    this.saveConfig()
    profileManager.saveProfiles().then(() => {
      profileManager.updateFactorioModlist()
      logger.log(1, 'Everything taken care of, closing app now.')
      app.quit()
    })
  }
}

// ---------------------------------------------------------
// Miscellaneous logic and helpers

AppManager.prototype.createWindow = function(screenWidth, screenHeight) {
  logger.log(1, 'Creating the application window')

  let config = this.config

  let windowOptions = {
    minWidth: screenWidth / 2,
    minHeight: screenHeight / 1.25,
    width: config.width,
    height: config.height,
    x: config.x_loc,
    y: config.y_loc,
    resizable: true,
    title: 'Lunar\'s [Factorio] Mod Manager',
    icon: `${__dirname}/../view/img/favicon.ico`
  }

  let window = new BrowserWindow(windowOptions)
  window.setMenu(null)
  if (this.config['debug'] === true)
    window.webContents.openDevTools()

  window.on('closed', function() {
    window = null
  })

  logger.log(1, 'Window created successfully, event registered')
  return window
}
