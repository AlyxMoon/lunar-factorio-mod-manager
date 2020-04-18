import { copyFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'

import logger from '@lib/logger'

export const config = {
  '>=2.1.1': store => {
    try {
      logger.info('Beginning store migration >=2.1.1')

      const newFolderPath = join(app.getPath('userData'), 'data')
      const configFilePath = join(app.getPath('userData'), 'config.json')
      const newConfigFilePath = join(newFolderPath, 'config.json')

      if (existsSync(configFilePath)) {
        logger.info(`Attempting to move config file in new data folder`)

        mkdirSync(newFolderPath, { recursive: true })
        copyFileSync(configFilePath, newConfigFilePath)
        unlinkSync(configFilePath)

        logger.info('Successfully moved config file into data folder')
      }

      logger.info('clearing old data in config file')
      store.delete('mods.online')
      store.delete('mods.onlineCount')
      store.delete('mods.onlineLastFetch')

      logger.info('updating values in config file')
      store.set('options.onlinePollingInterval', 1)

      logger.info('Finished store migration >=2.1.1')
    } catch (error) {
      logger.error(`Error during migration: ${error.message}`)
      throw error
    }
  },
}

export const onlineModsCache = {}
