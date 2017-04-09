import {List, fromJS} from 'immutable'

import {isVersionHigher} from './helpers'

export function setInstalledMods (state, installedMods) {
  return state.set('installedMods', fromJS(installedMods))
}

export function setSelectedInstalledMod (state, selectedInstalledMod) {
  const length = state.get('installedMods', List()).size
  if (selectedInstalledMod >= length) selectedInstalledMod = length - 1
  if (selectedInstalledMod < 0) selectedInstalledMod = 0

  return state.set('selectedInstalledMod', selectedInstalledMod)
}

export function deleteInstalledMod (state, index) {
  return state.update(
    'installedMods',
    installedMods => installedMods.delete(index)
  )
}

export function addLatestAvailableUpdate (installedMods, onlineMods) {
  if (!onlineMods) return installedMods

  return installedMods.map(installedMod => {
    const matchingOnlineMod = onlineMods.find(onlineMod => onlineMod.get('name') === installedMod.get('name'), null, List())
    const latestAvailableUpdate = matchingOnlineMod.get('releases', List()).find(release => {
      const versionHigher = isVersionHigher(installedMod.get('version'), release.get('version'))
      const sameFactorioVersion = installedMod.get('factorio_version') === release.get('factorio_version')
      return versionHigher && sameFactorioVersion
    })

    if (latestAvailableUpdate) return installedMod.set('latestAvailableUpdate', latestAvailableUpdate)
    else return installedMod
  })
}
