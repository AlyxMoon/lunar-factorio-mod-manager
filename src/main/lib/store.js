import Store from 'electron-store'

import * as migrations from '@shared/migrations'
import schema from '@shared/models'

const configSchema = {
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
})

export const onlineModsCache = new Store({
  cwd: 'data',
  name: 'onlineModsCache',
  serialize: value => JSON.stringify(value, null, 0),

  migrations: migrations.onlineModsCache,
  schema: schema.onlineModsCache,
})

export default config
