import Store from 'electron-store'

import packageData from '@/../../package.json'
import * as migrations from '@shared/migrations'
import schema from '@shared/models'

const configSchema = {
  meta: schema.meta,
  mods: schema.mods,
  options: schema.options,
  profiles: schema.profiles,
  paths: schema.paths,
  player: schema.player,
  window: schema.window,
}

export const config = new Store({
  cwd: 'data',
  serialize: value => JSON.stringify(value, null, 2),

  migrations: migrations.config,
  schema: configSchema,
  projectVersion: packageData.version,
  watch: true,
})

export const onlineModsCache = new Store({
  cwd: 'data',
  name: 'onlineModsCache',
  serialize: value => JSON.stringify(value, null, 0),

  migrations: migrations.onlineModsCache,
  schema: schema.onlineModsCache,
  projectVersion: packageData.version,
  watch: true,
})

// Workaround for an issue with app version 2.2.0 where migrations were being set incorrectly with the electron-store version of 5.1.1, causing migrations to only be run a single time until config was reset
if (config.get('__internal__.migrations.version') === '5.1.1') {
  config.delete('__internal__.migrations')
}

export default config
