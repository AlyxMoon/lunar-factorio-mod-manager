import {List, fromJS} from 'immutable'

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
