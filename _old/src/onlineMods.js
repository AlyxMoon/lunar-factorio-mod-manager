import {List, fromJS} from 'immutable'
import moment from 'moment'

export function setOnlineMods (state, onlineMods) {
  return state.set('onlineMods', fromJS(onlineMods))
}

export function setSelectedOnlineMod (state, index, releaseIndex) {
  const onlineModsLength = state.get('onlineMods', List()).size
  if (index >= onlineModsLength) {
    index = onlineModsLength - 1
    releaseIndex = 0
  }

  return state.set('selectedOnlineMod', fromJS([index, releaseIndex]))
}

export function setOnlineModFilter (state, filterKey, filterStatus) {
  return state.setIn(['onlineModFilters', filterKey], filterStatus)
}

export function setOnlineModSort (state, sortOption, direction) {
  return state.set('onlineModSort', fromJS([sortOption, direction]))
}

export function getSortedMods (mods, sortBy) {
  let [sortKey, sortDirection] = sortBy.toArray()
  let sortedMods

  if (sortKey === 'released_at') {
    sortedMods = mods.sort((a, b) => {
      let aVal = a.getIn(['releases', 0, 'released_at'])
      let bVal = b.getIn(['releases', 0, 'released_at'])

      if (moment(aVal).isAfter(bVal)) return -1
      if (moment(aVal).isBefore(bVal)) return 1
      if (moment(aVal).isSame(bVal)) return 0
    })
  } else {
    sortedMods = mods.sort((a, b) => {
      let aVal = a.get(sortKey)
      let bVal = b.get(sortKey)

      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()

      if (aVal < bVal) return -1
      if (aVal > bVal) return 1
      if (aVal === bVal) return 0
    })
  }

  if (sortDirection === 'descending') {
    return sortedMods.reverse()
  } else {
    return sortedMods
  }
}

export function getFilteredMods (onlineMods, filterOptions) {
  const filterInstall = filterOptions.get('installStatus', 'all')
  const filterTag = filterOptions.get('tag', 'all')

  return onlineMods.filter(mod => {
    if (filterTag === 'all') return true

    return mod.get('tags', List()).some(tag => {
      return filterTag === tag.get('name')
    })
  }).filter(mod => {
    if (filterInstall === 'all') return true

    let isInstalled = mod.get('isInstalled', false)
    return (isInstalled && filterInstall === 'installed') || (!isInstalled && filterInstall === 'not installed')
  })
}

export function addInstallStatus (onlineMods, installedMods) {
  return onlineMods.map(onlineMod => {
    if (installedMods.some(installedMod => installedMod.get('name') === onlineMod.get('name'))) {
      return onlineMod.set('isInstalled', true)
    } else {
      return onlineMod
    }
  })
}
