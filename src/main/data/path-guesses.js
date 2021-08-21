import { app } from 'electron'
import { join } from 'path'
import { platform } from 'os'

const currentPlatform = platform()
const appDataDir = app.getPath('appData')
const homeDir = app.getPath('home')

const paths = {
  factorioDataDir: [],
  factorioExe: [],
  modDir: [],
  playerDataFile: [],
  saveDir: [],
}

if (currentPlatform === 'win32') {
  paths.factorioDataDir.push(...[
    join('C:/Program Files/Factorio/data'),
    join('C:/Program Files (x86)/Factorio/data'),
    join('C:/Program Files/Steam/SteamApps/common/Factorio/data'),
    join('C:/Program Files (x86)/Steam/SteamApps/common/Factorio/data'),
  ])

  paths.factorioExe.push(...[
    join('C:/Program Files/Factorio/bin/x64/factorio.exe'),
    join('C:/Program Files (x86)/Factorio/bin/Win32/factorio.exe'),
    join('C:/Program Files/Steam/SteamApps/common/Factorio/bin/x64/factorio.exe'),
    join('C:/Program Files (x86)/Steam/SteamApps/common/Factorio/bin/Win32/factorio.exe'),
  ])

  paths.modDir.push(...[
    join(appDataDir, 'Factorio/mods'),
    join('C:/Program Files/Factorio/mods'),
    join('C:/Program Files (x86)/Factorio/mods'),
  ])

  paths.playerDataFile.push(...[
    join(appDataDir, 'Factorio/player-data.json'),
    join(appDataDir, 'Factorio/config/player-data.json'),
  ])

  paths.saveDir.push(...[
    join(appDataDir, 'Factorio/saves'),
    join('C:/Program Files/Factorio/saves'),
    join('C:/Program Files (x86)/Factorio/saves'),
  ])
}

if (currentPlatform === 'linux') {
  paths.factorioDataDir.push(...[
    join(homeDir, '.steam/steam/steamapps/common/Factorio/data'),
    join(homeDir, '.factorio/data'),
  ])

  paths.factorioExe.push(...[
    join(homeDir, '.steam/steam/steamapps/common/Factorio/bin/x64/factorio'),
    join(homeDir, '.steam/steam/steamapps/common/Factorio/bin/i386/factorio'),
    join(homeDir, '.factorio/bin/x64/factorio'),
    join(homeDir, '.factorio/bin/i386/factorio'),
  ])

  paths.modDir.push(...[
    join(homeDir, './factorio/mods'),
  ])

  paths.playerDataFile.push(...[
    join(homeDir, '.factorio/player-data.json'),
    join(homeDir, '.factorio/config/player-data.json'),
  ])

  paths.saveDir.push(...[
    join(homeDir, '.factorio/saves'),
  ])
}

if (currentPlatform === 'darwin') {
  paths.factorioDataDir.push(...[
    join(homeDir, 'Library/Application Support/Steam/steamapps/common/Factorio/factorio.app/Contents/data'),
    join('/Applications/factorio.app/Contents/data'),
  ])

  paths.factorioExe.push(...[
    join(homeDir, 'Library/Application Support/Steam/steamapps/common/Factorio/factorio.app/Contents/bin/factorio'),
    join('/Applications/factorio.app/Contents/bin/factorio'),
  ])

  paths.modDir.push(...[
    join(homeDir, 'Library/Application Support/factorio/mods'),
  ])

  paths.playerDataFile.push(...[
    join(homeDir, 'Library/Application Support/factorio/player-data.json'),
    join(homeDir, 'Library/Application Support/factorio/config/player-data.json'),
  ])

  paths.saveDir.push(...[
    join(homeDir, 'Library/Application Support/factorio/saves'),
  ])
}

export default paths
