const file = require('fs')
const path = require('path')
const moment = require('moment')

// ---------------------------------------------------------
// Primary class declaration

// Debug Level should be one of the following values:
// 0 - Debug, save everything
// 1 - Informative, messages such as program flow and events
// 2 - Warning, something went wrong but won't affect overall program flow
// 3 - Error, something went wrong and could hamper application or affect data
// 4 - Critical, something went really wrong and application can't continue
class Logger {
  constructor() {
    this.logPath = path.join(__dirname, '..', 'data', 'lmm_log.txt')
    this.debugLevel = 1
  }

  // ---------------------------------------------------------
  // Getters/Setters

  getLogPath() {
    return this.logPath
  }

  setLogPath(logPath) {
    if (typeof (logPath) !== 'string') return false
    let elements = path.parse(logPath)
    if (elements.dir === undefined || elements.base === undefined || elements.name === undefined || elements.ext !== '.txt') return false

    this.logPath = logPath
    return true
  }

  getDebugLevel() {
    return this.debugLevel
  }

  setDebugLevel(debugLevel) {
    if (typeof (debugLevel) !== 'number' || debugLevel < 0 || debugLevel > 4) return false

    this.debugLevel = debugLevel
    return true
  }

  // ---------------------------------------------------------
  // Core Functionality

  // Saves logs in the following format:
  // '${timestamp} | ${debugLevel} | ${message}'
  // If a data object is sent to the log function, each item is printed on an individual line after the initial line, in the format:
  // '${key/index} : ${value}'
  log(level, message, data) {
    if (typeof (level) !== 'number' || level < 0 || level > 4) return false
    if (message === null || message === undefined) return false
    if (level < this.debugLevel) return false

    let levelText
    if (level === 0) levelText = 'DEBUG'
    else if (level === 1) levelText = 'INFO'
    else if (level === 2) levelText = 'WARNING'
    else if (level === 3) levelText = 'ERROR'
    else if (level === 4) levelText = 'CRITICAL'

    try {
      file.appendFileSync(this.logPath, `${moment().format('YYYY-MM-DD HH:mm:ss')} | ${levelText} | ${String(message).trim()}\n`)
    } catch (error) {
      return false
    }

    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        try {
          file.appendFileSync(this.logPath, `${i} : ${data[i]}\n`)
        } catch (error) {
          return false
        }
      }
    } else if (typeof (data) === 'object') {
      for (var prop in data) {
        if (!data.hasOwnProperty(prop)) continue
        else file.appendFileSync(this.logPath, `${prop} : ${data[prop]}\n`)
      }
    }

    return true
  }

  loadLogFile(callback) {
    if (typeof (callback) !== 'function') {
      throw new Error('Provided callback to Logger.loadLogFile() was not a function.')
    }
    file.readFile(this.logPath, {encoding: 'utf8'}, (error, data) => {
      return callback(error, data)
    })
  }

  clearLogFile(callback) {
    file.writeFile(this.logPath, '', (error) => {
      if (callback && typeof (callback) === 'function') {
        return callback(error)
      }
    })
  }
}

module.exports = new Logger()
