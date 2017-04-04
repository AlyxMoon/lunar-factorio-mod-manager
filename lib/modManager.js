const fs = require('fs')
const path = require('path')
const request = require('request')
const JSZip = require('jszip')

const logger = require('./logger.js')
const helpers = require('./helpers.js')

//module.exports = ModManager

// ---------------------------------------------------------
// Primary class declaration

// TODO: Make mods be ready before this so they can be provided in constructor
class ModManager {
  constructor(modListPath, modDirectoryPath, baseModPath, playerDataPath) {
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
  getModListPath() {
    logger.log(0, `ModManager.getModListPath() called, return: ${this.modListPath}`)
    return this.modListPath
  }

  setModListPath(modListPath) {
    logger.log(0, `ModManager.setModListPath() called with argument: ${modListPath}`)
    if (typeof (modListPath) !== 'string') return false
    let elements = path.parse(modListPath)
    if (elements.dir === undefined || elements.base === undefined || elements.name === undefined || elements.ext === '') {
      return false
    }
    this.modListPath = modListPath
    return true
  }

  getModDirectoryPath() {
    logger.log(0, `ModManager.getModDirectoryPath() called, return: ${this.modDirectoryPath}`)
    return this.modDirectoryPath
  }

  setModDirectoryPath(modDirectoryPath) {
    logger.log(0, `ModManager.setModDirectoryPath() called with argument: ${modDirectoryPath}`)
    if (typeof (modDirectoryPath) !== 'string') return false
    let elements = path.parse(modDirectoryPath)
    if (elements.dir === undefined || elements.base === undefined || elements.name === undefined || elements.ext !== '') {
      return false
    }
    this.modDirectoryPath = modDirectoryPath
    return true
  }

  getBaseModPath() {
    logger.log(0, `ModManager.getBaseModPath() called, return: ${this.baseModPath}`)
    return this.baseModPath
  }

  setBaseModPath(baseModPath) {
    logger.log(0, `ModManager.setBaseModPath() called with argument: ${baseModPath}`)
    if (typeof (baseModPath) !== 'string') return false
    let elements = path.parse(baseModPath)
    if (elements.dir === undefined || elements.base === undefined || elements.name === undefined || elements.ext !== '') {
      return false
    }
    this.baseModPath = baseModPath
    return true
  }

  getPlayerDataPath() {
    logger.log(0, `ModManager.getPlayerDataPath() called, return: ${this.playerDataPath}`)
    return this.playerDataPath
  }

  setPlayerDataPath(playerDataPath) {
    logger.log(0, `ModManager.setPlayerDataPath() called with argument: ${playerDataPath}`)
    if (typeof (playerDataPath) !== 'string') return false
    let elements = path.parse(playerDataPath)
    if (elements.dir === undefined || elements.base === undefined || elements.name === undefined || elements.ext === '') {
      return false
    }
    this.playerDataPath = playerDataPath
    return true
  }

  getPlayerUsername() {
    logger.log(0, `ModManager.getPlayerUsername() called, return: ${this.playerUsername}`)
    return this.playerUsername
  }

  getPlayerToken() {
    logger.log(0, `ModManager.getPlayerToken() called. Token not logged for privacy.`)
    return this.playerToken
  }

  getFactorioVersion() {
    logger.log(0, `ModManager.getFactorioVersion() called, return: ${this.factorioVersion}`)
    return this.factorioVersion
  }

  setFactorioVersion(factorioVersion) {
    logger.log(0, `ModManager.setFactorioVersion() called with argument: ${factorioVersion}`)
    if (typeof (factorioVersion) !== 'string') return false
    this.factorioVersion = factorioVersion
    return true
  }

  getInstalledMods() {
    logger.log(0, `ModManager.getInstalledMods() called`, this.installedMods)
    return this.installedMods
  }

  getInstalledModNames() {
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

  areInstalledModsLoaded() {
    return this.installedModsLoaded
  }

  getOnlineMods() {
    logger.log(0, `ModManager.getOnlineMods() called`, this.onlineMods)
    return this.onlineMods
  }

  getOnlineModNames() {
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

  areOnlineModsFetched() {
    return this.onlineModsFetched
  }

  getOnlineModCount() {
    return this.onlineModTotalCount
  }

  getOnlineModFetchedCount() {
    return this.onlineModFetchedCount
  }

  // ---------------------------------------------------------
  // File Management

  loadInstalledMods() {
    return new Promise((resolve, reject) => {
      logger.log(1, 'ModManager.loadInstalledMods() called')

      this.installedMods = []
      this.installedModsLoaded = false
      let self = this

        // Load base mod information
      let baseInfoPath = path.join(this.baseModPath, 'info.json')
      fs.readFile(baseInfoPath, 'utf8', (error, data) => {
        if (error) reject(error)
        let baseMod = addModToArray(data)
        self.setFactorioVersion(baseMod.version)
      })

        // Read files in mod directory
      fs.readdir(this.modDirectoryPath, 'utf8', (error, files) => {
        if (error) reject(error)

            // Filter out non-zip files
        files = files.filter(function (elem) {
          return elem.slice(-4) === '.zip'
        })

            // If no zip files are in the folder
        if (files.length === 0) {
          this.installedModsLoaded = true
          resolve()
        }

            // Process zip files
        for (var i = 0, len = files.length, counter = files.length; i < len; i++) {
                // Open zip files as buffers
          fs.readFile(`${this.modDirectoryPath}${files[i]}`, (error, rawZipBuffer) => {
            logger.log(0, 'Number of mods to parse: ' + counter)
            if (error) reject(error)

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
                resolve()
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
          reject(error)
        }
        return data
      }
    })
  }

  loadPlayerData() {
    return new Promise((resolve, reject) => {
      logger.log(1, 'ModManager.loadPlayerData() called')

      fs.readFile(this.playerDataPath, 'utf8', (err, data) => {
        if (err) reject(err)

        try {
          data = JSON.parse(data)
        } catch (error) {
          logger.log(3, 'Error when attempting to parse JSON in ModManager.loadPlayerData()', error)
          reject(error)
        }

        if ('service-username' in data && 'service-token' in data) {
          this.playerUsername = data['service-username']
          this.playerToken = data['service-token']
        }
        resolve()
      })
    })
  }

  deleteModFromList(modName, modVersion) {
    logger.log(1, `ModManager.deleteMod() called with modName: ${modName}`)

    for (var i = this.installedMods.length - 1; i >= 0; i--) {
      if (this.installedMods[i].name === modName && this.installedMods[i].version === modVersion) {
        this.installedMods.splice(i, 1)
        break
      }
    }
  }

  // ---------------------------------------------------------
  // Online Mod Management

  // window is an optional argument, if given will send data once loaded
  fetchOnlineMods() {
    logger.log(1, 'Beginning to fetch online mods.')

    let self = this
    self.onlineMods = []
    self.onlineModsFetched = false
    self.onlineModTotalCount = 0
    self.onlineModFetchedCount = 0

    let apiURL = 'https://mods.factorio.com/api/mods'
    let options = '?page_size=20'
    let pageCount = 1
    let currentPage = 1

    let modPromises = []
    let modUrls = []
    let pagePromises = []

    request(`${apiURL}${options}&page=1`, (error, response, data) => {
      if (!error && response.statusCode === 200) {
        data = JSON.parse(data)
        self.onlineModTotalCount = data.pagination.count
        pageCount = data.pagination.page_count

        for (let i = 1; i <= pageCount; i++) {
          pagePromises.push(fetchOnlineModList(`${apiURL}${options}&page=${i}`))
        }

        Promise.all(pagePromises).then(() => {
          logger.log(1, 'All mod pages were successfully fetched.')
          modUrls.forEach((url) => {
            modPromises.push(fetchFullOnlineMod(url))
          })
          Promise.all(modPromises).then(() => {
            self.onlineModsFetched = true
            logger.log(1, 'All online mods were successfully fetched.')
          }).catch((error) => {
            logger.log(3, 'Error when fetching mod info from the online mod portal. Continuing without any related functionality.', error)
          })
        }).catch((error) => {
          logger.log(3, 'Error when loading pages from the online mod portal. Continuing without any related functionality.', error)
        })
      } else {
        logger.log(3, 'Error when connecting to the online mod portal. Continuing without any related functionality.', error)
      }
    })

    function fetchOnlineModList (url) {
      return new Promise((resolve, reject) => {
        request(url, (error, response, data) => {
          if (!error && response.statusCode === 200) {
            data = JSON.parse(data)
            for (let i = 0; i < data['results'].length; i++) {
              modUrls.push(`${apiURL}/${data.results[i].name}`)
            }
            resolve()
          } else {
            reject()
          }
        })
      })
    }

    function fetchFullOnlineMod (url) {
      return new Promise((resolve, reject) => {
        request(url, (error, response, data) => {
          if (!error && response.statusCode === 200) {
            self.onlineMods.push(JSON.parse(data))
            self.onlineModFetchedCount++
            resolve()
          } else {
            reject(error)
          }
        })
      })
    }
  }

  getModNameFromID(modID) {
    let mods = this.onlineMods
    let modToDownload
    let modName

    for (let i = mods.length - 1; i >= 0; i--) {
      if (mods[i]['id'] === modID) {
        modToDownload = mods[i]
        modName = mods[i].name
        break
      }
    }

    return modName
  }

  // ---------------------------------------------------------
  // Helper and Miscellaneous Logic

  getFactorioModList() {
    logger.log(1, 'Checking for mod list at path: ' + this.modListPath)

    let data = fs.readFileSync(this.modListPath, 'utf8')
    return JSON.parse(data)['mods']
  }
}

module.exports = ModManager
