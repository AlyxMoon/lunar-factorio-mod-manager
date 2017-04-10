import {Map} from 'immutable'

import * as Profiles from './profiles'
import * as InstalledMods from './installedMods'
import * as OnlineMods from './onlineMods'
import * as About from './about'
import * as Footer from './footer'

export default function reducer (state = Map(), action) {
  switch (action.type) {
    case 'SET_ROUTES':
      return Profiles.setRoutes(state, action.routes)
    case 'SET_ACTIVE_TAB':
      return Profiles.setActiveTab(state, action.tab)
    case 'SET_PROFILES':
      return Profiles.setProfiles(state, action.profiles)
    case 'SET_ACTIVE_PROFILE':
      return Profiles.setActiveProfile(state, action.activeProfile)
    case 'ADD_PROFILE':
      return Profiles.addProfile(state)
    case 'RENAME_PROFILE':
      return Profiles.renameProfile(state, action.index, action.name)
    case 'DELETE_PROFILE':
      return Profiles.deleteProfile(state, action.index)
    case 'MOVE_PROFILE_UP':
      return Profiles.moveProfileUp(state, action.index)
    case 'MOVE_PROFILE_DOWN':
      return Profiles.moveProfileDown(state, action.index)
    case 'TOGGLE_MOD_STATUS':
      return Profiles.toggleModStatus(state, action.profileIndex, action.modIndex)

    case 'SET_INSTALLED_MODS':
      return InstalledMods.setInstalledMods(state, action.installedMods)
    case 'SET_SELECTED_INSTALLED_MOD':
      return InstalledMods.setSelectedInstalledMod(state, action.selectedInstalledMod)
    case 'DELETE_INSTALLED_MOD':
      return InstalledMods.deleteInstalledMod(state, action.index)

    case 'SET_ONLINE_MODS':
      return OnlineMods.setOnlineMods(state, action.onlineMods)
    case 'SET_SELECTED_ONLINE_MOD':
      return OnlineMods.setSelectedOnlineMod(state, action.index, action.releaseIndex)
    case 'SET_ONLINE_MOD_FILTER':
      return OnlineMods.setOnlineModFilter(state, action.filterKey, action.filterOption)
    case 'SET_ONLINE_MOD_SORT':
      return OnlineMods.setOnlineModSort(state, action.sortOption, action.direction)

    case 'SET_APP_CURRENT_VERSION':
      return About.setAppCurrentVersion(state, action.version)
    case 'SET_APP_LATEST_VERSION':
      return About.setAppLatestVersion(state, action.version)

    case 'SET_PLAYER_NAME':
      return Footer.setPlayerName(state, action.playerName)
    case 'SET_ONLINE_MODS_FETCHED_COUNT':
      return Footer.setOnlineModsFetchedCount(state, action.onlineModsFetchedCount)
    case 'SET_ONLINE_MODS_COUNT':
      return Footer.setOnlineModsCount(state, action.onlineModsCount)
    case 'SET_FACTORIO_VERSION':
      return Footer.setFactorioVersion(state, action.version)
  }
  return state
}
