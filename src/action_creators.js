export function setRoutes (routes) {
  return {
    type: 'SET_ROUTES',
    routes
  }
}
export function setActiveTab (tab) {
  return {
    type: 'SET_ACTIVE_TAB',
    tab
  }
}

export function setProfiles (profiles) {
  return {
    type: 'SET_PROFILES',
    profiles
  }
}

export function setActiveProfile (activeProfile) {
  return {
    meta: { sendToMain: true },
    type: 'SET_ACTIVE_PROFILE',
    activeProfile
  }
}

export function addProfile () {
  return {
    meta: { sendToMain: true },
    type: 'ADD_PROFILE'
  }
}

export function renameProfile (index, name) {
  return {
    meta: { sendToMain: true },
    type: 'RENAME_PROFILE',
    index,
    name
  }
}

export function deleteProfile (index) {
  return {
    meta: { sendToMain: true },
    type: 'DELETE_PROFILE',
    index
  }
}

export function moveProfileUp (index) {
  return {
    meta: { sendToMain: true },
    type: 'MOVE_PROFILE_UP',
    index
  }
}

export function moveProfileDown (index) {
  return {
    meta: { sendToMain: true },
    type: 'MOVE_PROFILE_DOWN',
    index
  }
}

export function toggleModStatus (profileIndex, modIndex) {
  return {
    meta: { sendToMain: true },
    type: 'TOGGLE_MOD_STATUS',
    profileIndex,
    modIndex
  }
}

export function setInstalledMods (installedMods) {
  return {
    type: 'SET_INSTALLED_MODS',
    installedMods
  }
}

export function setSelectedInstalledMod (selectedInstalledMod) {
  return {
    type: 'SET_SELECTED_INSTALLED_MOD',
    selectedInstalledMod
  }
}

export function deleteInstalledMod (index) {
  return {
    meta: { sendToMain: true },
    type: 'DELETE_INSTALLED_MOD',
    index
  }
}

export function setAppCurrentVersion (version) {
  return {
    type: 'SET_APP_CURRENT_VERSION',
    version
  }
}

export function setAppLatestVersion (version) {
  return {
    type: 'SET_APP_LATEST_VERSION',
    version
  }
}

export function openExternalLink (link) {
  return {
    meta: { isExternalLink: true },
    type: 'OPEN_EXTERNAL_LINK',
    link
  }
}

export function setPlayerName (playerName) {
  return {
    type: 'SET_PLAYER_NAME',
    playerName
  }
}

export function setOnlineModsFetchedCount (onlineModsFetchedCount) {
  return {
    type: 'SET_ONLINE_MODS_FETCHED_COUNT',
    onlineModsFetchedCount
  }
}

export function setOnlineModsCount (onlineModsCount) {
  return {
    type: 'SET_ONLINE_MODS_COUNT',
    onlineModsCount
  }
}

export function setFactorioVersion (version) {
  return {
    type: 'SET_FACTORIO_VERSION',
    version
  }
}

export function setOnlineMods (onlineMods) {
  return {
    type: 'SET_ONLINE_MODS',
    onlineMods
  }
}

export function setSelectedOnlineMod (index, releaseIndex) {
  return {
    type: 'SET_SELECTED_ONLINE_MOD',
    index,
    releaseIndex
  }
}

export function setOnlineModFilter (filterKey, filterOption) {
  return {
    type: 'SET_ONLINE_MOD_FILTER',
    filterKey,
    filterOption
  }
}

export function setOnlineModSort (sortOption, direction) {
  return {
    type: 'SET_ONLINE_MOD_SORT',
    sortOption,
    direction
  }
}

export function requestDownload (id, link) {
  return {
    meta: { sendToMain: true },
    type: 'REQUEST_DOWNLOAD',
    id,
    link
  }
}
