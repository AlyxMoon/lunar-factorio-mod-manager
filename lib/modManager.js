const fs = require('fs')
const path = require('path')
const request = require('request')
const JSZip = require('jszip')

const logger = require('./logger.js')
const helpers = require('./helpers.js')

module.exports = ModManager
// ---------------------------------------------------------
// Primary class declaration

// TODO: Make mods be ready before this so they can be provided in constructor
function ModManager (modListPath, modDirectoryPath, baseModPath, playerDataPath) {
  this.modListPath = ''
  this.modDirectoryPath = ''
  this.baseModPath = ''
  this.playerDataPath = ''

  this.factorioVersion = ''
  this.playerUsername = ''
  this.playerToken = ''

  this.installedMods = []
  this.installedModsLoaded = false

  this.onlineMods = []
  this.onlineModsFetched = false
  this.onlineModTotalCount = 0 // Total number of mods in the mod portal
  this.onlineModFetchedCount = 0 // The number of mods fetched so far, used for progress indicator

  if (!this.setModListPath(modListPath)) throw new Error('modListPath was not a valid filePath.')
  if (!this.setModDirectoryPath(modDirectoryPath)) throw new Error('modDirectoryPath was not a valid directory.')
  if (!this.setBaseModPath(baseModPath)) throw new Error('baseModPath was not a valid directory.')
  if (!this.setPlayerDataPath(playerDataPath)) throw new Error('playerDataPath was not a valid filePath.')
}

// ---------------------------------------------------------
// Getters / Setters
ModManager.prototype.getModListPath = function () {
  logger.log(0, `ModManager.getModListPath() called, return: ${this.modListPath}`)
  return this.modListPath
}
ModManager.prototype.setModListPath = function (modListPath) {
  logger.log(0, `ModManager.setModListPath() called with argument: ${modListPath}`)
  if (typeof (modListPath) !== 'string') return false
  let elements = path.parse(modListPath)
  if (elements.dir === undefined || elements.base === undefined || elements.name === undefined || elements.ext === '') {
    return false
  }
  this.modListPath = modListPath
  return true
}

ModManager.prototype.getModDirectoryPath = function () {
  logger.log(0, `ModManager.getModDirectoryPath() called, return: ${this.modDirectoryPath}`)
  return this.modDirectoryPath
}
ModManager.prototype.setModDirectoryPath = function (modDirectoryPath) {
  logger.log(0, `ModManager.setModDirectoryPath() called with argument: ${modDirectoryPath}`)
  if (typeof (modDirectoryPath) !== 'string') return false
  let elements = path.parse(modDirectoryPath)
  if (elements.dir === undefined || elements.base === undefined || elements.name === undefined || elements.ext !== '') {
    return false
  }
  this.modDirectoryPath = modDirectoryPath
  return true
}

ModManager.prototype.getBaseModPath = function () {
  logger.log(0, `ModManager.getBaseModPath() called, return: ${this.baseModPath}`)
  return this.baseModPath
}
ModManager.prototype.setBaseModPath = function (baseModPath) {
  logger.log(0, `ModManager.setBaseModPath() called with argument: ${baseModPath}`)
  if (typeof (baseModPath) !== 'string') return false
  let elements = path.parse(baseModPath)
  if (elements.dir === undefined || elements.base === undefined || elements.name === undefined || elements.ext !== '') {
    return false
  }
  this.baseModPath = baseModPath
  return true
}

ModManager.prototype.getPlayerDataPath = function () {
  logger.log(0, `ModManager.getPlayerDataPath() called, return: ${this.playerDataPath}`)
  return this.playerDataPath
}
ModManager.prototype.setPlayerDataPath = function (playerDataPath) {
  logger.log(0, `ModManager.setPlayerDataPath() called with argument: ${playerDataPath}`)
  if (typeof (playerDataPath) !== 'string') return false
  let elements = path.parse(playerDataPath)
  if (elements.dir === undefined || elements.base === undefined || elements.name === undefined || elements.ext === '') {
    return false
  }
  this.playerDataPath = playerDataPath
  return true
}

ModManager.prototype.getPlayerUsername = function () {
  logger.log(0, `ModManager.getPlayerUsername() called, return: ${this.playerUsername}`)
  return this.playerUsername
}

ModManager.prototype.getPlayerToken = function () {
  logger.log(0, `ModManager.getPlayerToken() called. Token not logged for privacy.`)
  return this.playerToken
}

ModManager.prototype.getFactorioVersion = function () {
  logger.log(0, `ModManager.getFactorioVersion() called, return: ${this.factorioVersion}`)
  return this.factorioVersion
}
ModManager.prototype.setFactorioVersion = function (factorioVersion) {
  logger.log(0, `ModManager.setFactorioVersion() called with argument: ${factorioVersion}`)
  if (typeof (factorioVersion) !== 'string') return false
  this.factorioVersion = factorioVersion
  return true
}

ModManager.prototype.getInstalledMods = function () {
  logger.log(0, `ModManager.getInstalledMods() called`, this.installedMods)
  return this.installedMods
}
ModManager.prototype.getInstalledModNames = function () {
  logger.log(0, `ModManager.getInstalledModNames() called.`)
  let modNames = []
  if (Array.isArray(this.installedMods)) {
    modNames = this.installedMods.filter((mod) => {
      return 'name' in mod
    }).map((mod) => {
      return mod.name
    })
  }
  logger.log(0, 'Return value for ModManager.getInstalledModNames(): ', modNames)
  return modNames
}
ModManager.prototype.areInstalledModsLoaded = function () {
  return this.installedModsLoaded
}

ModManager.prototype.getOnlineMods = function () {
  logger.log(0, `ModManager.getOnlineMods() called`, this.onlineMods)
  return this.onlineMods
}
ModManager.prototype.getOnlineModNames = function () {
  logger.log(0, `ModManager.getOnlineModNames() called.`)
  let modNames = []
  if (Array.isArray(this.installedMods)) {
    modNames = this.installedMods.filter((mod) => {
      return 'name' in mod
    }).map((mod) => {
      return mod.name
    })
  }
  logger.log(0, 'Return value for ModManager.getOnlineModNames(): ', modNames)
  return modNames
}
ModManager.prototype.areOnlineModsFetched = function () {
  return this.onlineModsFetched
}

ModManager.prototype.getOnlineModCount = function () {
  return this.onlineModTotalCount
}
ModManager.prototype.getOnlineModFetchedCount = function () {
  return this.onlineModFetchedCount
}
// ---------------------------------------------------------
// File Management

ModManager.prototype.loadInstalledMods = function (callback) {
  logger.log(1, 'ModManager.loadInstalledMods() called')
  if (typeof (callback) !== 'function') callback = function () {}

  this.installedMods = []
  this.installedModsLoaded = false
  let self = this

    // Load base mod information
  let baseInfoPath = path.join(this.baseModPath, 'info.json')
  fs.readFile(baseInfoPath, 'utf8', (error, data) => {
    if (error) return callback(error)
    let baseMod = addModToArray(data)
    self.setFactorioVersion(baseMod.version)
  })

    // Read files in mod directory
  fs.readdir(this.modDirectoryPath, 'utf8', (error, files) => {
    if (error) return callback(error)

        // Filter out non-zip files
    files = files.filter(function (elem) {
      return elem.slice(-4) === '.zip'
    })

        // If no zip files are in the folder
    if (files.length === 0) {
      this.installedModsLoaded = true
      return callback(null)
    }

        // Process zip files
    for (var i = 0, len = files.length, counter = files.length; i < len; i++) {
            // Open zip files as buffers
      fs.readFile(`${this.modDirectoryPath}${files[i]}`, (error, rawZipBuffer) => {
        logger.log(0, 'Number of mods to parse: ' + counter)
        if (error) return callback(error)

                // Actually read the zip file
        JSZip.loadAsync(rawZipBuffer).then((zip) => {
          logger.log(0, 'Reading zip file')
                    // Only open the mods info file in the zip
          return zip.file(/info\.json/)[0].async('text')
        }).then((modData) => {
          logger.log(0, 'Saving information from zip file')
                    // Save the information
          addModToArray(modData)

                    // Only show once all zip files have been read
          counter--
          logger.log(0, 'Counter currently at: ' + counter)
          if (counter <= 0) {
            logger.log(1, 'Loaded all installed mods')
            this.installedModsLoaded = true
            this.installedMods = helpers.sortArrayByProp(this.installedMods, 'name')
            return callback(null)
          }
        })
      })
    }
  })

  function addModToArray (modJSON) {
    let data
    try {
      data = JSON.parse(modJSON)
      self.installedMods.push(data)
      logger.log(0, 'Added mod to ModManager.installedMods', data)
    } catch (error) {
      return callback(error)
    }
    return data
  }
}

ModManager.prototype.loadPlayerData = function (callback) {
  logger.log(1, 'ModManager.loadPlayerData() called')
  if (typeof (callback) !== 'function') callback = function () {}

  fs.readFile(this.playerDataPath, 'utf8', (err, data) => {
    if (err) return callback(err)

    try {
      data = JSON.parse(data)
    } catch (error) {
      logger.log(3, 'Error when attempting to parse JSON in ModManager.loadPlayerData()', error)
      return callback(error)
    }

    if ('service-username' in data && 'service-token' in data) {
      this.playerUsername = data['service-username']
      this.playerToken = data['service-token']
    }
    return callback()
  })
}

ModManager.prototype.deleteMod = function (index, callback) {
  logger.log(1, `ModManager.deleteMod() called with index: ${index}`)
  if (typeof (callback) !== 'function') callback = function () {}
  let name = this.installedMods[index].name
  let version = this.installedMods[index].version
  this.installedMods.splice(index, 1)

  let modPath = path.join(this.modDirectoryPath, `${name}_${version}.zip`)
  fs.unlink(modPath, function (err) {
    if (err) logger.log(2, `Was not able to delete a mod. Error:`, err)
    callback()
  })
}
// ---------------------------------------------------------
// Online Mod Management

// window is an optional argument, if given will send data once loaded
ModManager.prototype.fetchOnlineMods = function () {
  logger.log(1, 'Beginning to fetch online mods.')
  let self = this // Required to get class variables working properly in nested functions
  self.onlineMods = []
  self.onlineModsFetched = false
  self.onlineModTotalCount = 0
  self.onlineModFetchedCount = 0

  let apiURL = 'https://mods.factorio.com/api/mods'
  let options = '?page_size=20'

  fetchOnlineModInfo(`${apiURL}${options}`, (error) => {
    if (error) {
      self.onlineMods = []
      logger.log(3, 'Error when fetching mods from the online mod portal. Continuing without any related functionality.', error)
    } else {
      self.onlineModsFetched = true
      logger.log(1, 'All online mods were successfully fetched.')
    }
  })

  function fetchOnlineModInfo (url, callback) {
    request(url, (error, response, data) => {
      if (!error && response.statusCode === 200) {
        data = JSON.parse(data)
        self.onlineModTotalCount = data.pagination.count

        for (let i = 0; i < data['results'].length; i++) {
          fetchFullOnlineMod(`${apiURL}/${data.results[i].name}`, (error) => {
            if (error) return callback(error)
            if (self.onlineModFetchedCount >= self.onlineModTotalCount) return callback(null)
          })
        }

        if (data['pagination']['links']['next']) {
          fetchOnlineModInfo(data['pagination']['links']['next'], callback)
        }
      } else {
        return callback(error)
      }
    })
  }

  function fetchFullOnlineMod (url, callback) {
    request(url, (error, response, data) => {
      if (!error && response.statusCode === 200) {
        self.onlineMods.push(JSON.parse(data))
        self.onlineModFetchedCount++
        return callback(null)
      } else {
        return callback(error)
      }
    })
  }
}

ModManager.prototype.getDownloadInfo = function (modID, modLink, callback) {
  if (!this.playerUsername || !this.playerToken) {
    return callback(Error('Attempting downloading mod when player credentials have not been set'))
  }

  let mods = this.onlineMods
  let modToDownload
  let modName
  let modIndex

  for (let i = mods.length - 1; i >= 0; i--) {
    if (mods[i]['id'] === modID) {
      modToDownload = mods[i]
      modName = mods[i].name
      break
    }
  }

  // If already installed, we're updating and need to delete the existing zip file
  for (let j = this.installedMods.length - 1; j >= 0; j--) {
    if (this.installedMods[j].name === modToDownload.name) {
      modIndex = j
      break
    }
  }

  let downloadLink = `https://mods.factorio.com${modLink}?username=${this.playerUsername}&token=${this.playerToken}`
  return callback(null, downloadLink, modName, modIndex)
}

// ---------------------------------------------------------
// Helper and Miscellaneous Logic

ModManager.prototype.getFactorioModList = function () {
  logger.log(1, 'Checking for mod list at path: ' + this.modListPath)

  let data = fs.readFileSync(this.modListPath, 'utf8')
  return JSON.parse(data)['mods']
}
