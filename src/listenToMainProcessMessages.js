const {ipcRenderer} = require('electron')

import * as actionCreators from './action_creators'

export default function (store) {
  ipcRenderer.on('ping', (e, data) => {
    console.log(data)
  })

  ipcRenderer.on('dataAllProfiles', (e, profiles) => {
    store.dispatch(actionCreators.setProfiles(profiles))
  })

  ipcRenderer.on('dataActiveProfile', (e, activeProfile) => {
    // TODO get Main Process side using index for activeProfile instead of an actual profile
    let index = 0
    store.getState().get('profiles').map((profile, key) => {
      if (profile.get('name') === activeProfile.name) {
        index = key
      }
    })
    store.dispatch(actionCreators.setActiveProfile(index))
  })

  ipcRenderer.on('dataInstalledMods', (e, mods) => {
    store.dispatch(actionCreators.setInstalledMods(mods))
  })

  ipcRenderer.on('dataOnlineMods', (e, mods) => {
    store.dispatch(actionCreators.setOnlineMods(mods))
  })

  ipcRenderer.on('dataModFetchStatus', (e, loaded, modsFetched, totalModCount) => {
    if (!loaded) {
      window.setTimeout(() => {
        ipcRenderer.send('requestModFetchStatus')
      }, 1000)
    } else {
      ipcRenderer.send('requestOnlineMods')
    }
    store.dispatch(actionCreators.setOnlineModsFetchedCount(modsFetched))
    store.dispatch(actionCreators.setOnlineModsCount(totalModCount))
  })

  ipcRenderer.on('dataPlayerInfo', (e, username) => {
    store.dispatch(actionCreators.setPlayerName(username))
  })

  ipcRenderer.on('dataAppVersionInfo', (e, currentVersion, latestVersion, latestVersionLink) => {
    store.dispatch(actionCreators.setAppCurrentVersion(currentVersion))
    store.dispatch(actionCreators.setAppLatestVersion(latestVersion))
  })

  ipcRenderer.on('dataFactorioVersion', (e, version) => {
    store.dispatch(actionCreators.setFactorioVersion(version))
  })

  ipcRenderer.send('requestAllProfiles')
  ipcRenderer.send('requestActiveProfile')
  ipcRenderer.send('requestInstalledMods')
  ipcRenderer.send('requestModFetchStatus')
  ipcRenderer.send('requestPlayerInfo')
  ipcRenderer.send('requestFactorioVersion')
  ipcRenderer.send('requestAppVersionInfo')
}
