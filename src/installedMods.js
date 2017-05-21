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

export function addMissingDependencies (installedMods) {
  return installedMods.map(installedMod => {
    return installedMod.update(
      'dependencies',
      List(),
      dependencies => {
        if (typeof dependencies === 'string') return List.of(dependencies)
        else return dependencies
      }
    )
  }).map(installedMod => {
    let dependencies = installedMod.get('dependencies', List())
    let missingDependencies = dependencies.filter(dependency => {
      dependency = dependency.trim()
      if (dependency[0] === '?') return false

      let name, version
      let indexOfThingy = dependency.indexOf('>=')
      if (indexOfThingy === -1) {
        name = dependency.trim()
        version = '0.0.0'
      } else {
        name = dependency.slice(0, indexOfThingy).trim()
        version = dependency.slice(indexOfThingy + 2).trim()
      }

      let modDependency = installedMods.find(mod => mod.get('name') === name)
      if (!modDependency) return true

      let versionHigher = isVersionHigher(modDependency.get('version'), version)
      return versionHigher
    })

    if (missingDependencies.size === 0) return installedMod
    else return installedMod.set('missingDependencies', missingDependencies)
  })
}
