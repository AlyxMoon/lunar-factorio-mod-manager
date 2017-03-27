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
    type: 'SET_ACTIVE_PROFILE',
    activeProfile
  }
}

export function addProfile () {
  return {
    type: 'ADD_PROFILE'
  }
}

export function renameProfile (index, name) {
  return {
    type: 'RENAME_PROFILE',
    index,
    name
  }
}

export function deleteProfile (index) {
  return {
    type: 'DELETE_PROFILE',
    index
  }
}

export function moveProfileUp (index) {
  return {
    type: 'MOVE_PROFILE_UP',
    index
  }
}

export function moveProfileDown (index) {
  return {
    type: 'MOVE_PROFILE_DOWN',
    index
  }
}

export function toggleModStatus (profileIndex, modIndex) {
  return {
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
