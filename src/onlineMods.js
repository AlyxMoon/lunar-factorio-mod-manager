import {Map, List, fromJS} from 'immutable'

export function setOnlineMods (state, onlineMods) {
  return state.set('onlineMods', fromJS(onlineMods))
}

export function setSelectedOnlineMod (state, index, releaseIndex) {
  const onlineModsLength = state.get('onlineMods', List()).size
  if (index >= onlineModsLength) {
    index = onlineModsLength - 1
    releaseIndex = 0
  }
  if (releaseIndex >= state.get('onlineMods', List()).get('releases', Map()).size) {
    releaseIndex = 0
  }

  return state.set('selectedOnlineMod', fromJS([index, releaseIndex]))
}

export function setOnlineModFilter (state, filterOption) {
  return state.set('onlineModFilter', filterOption)
}

export function setOnlineModSort (state, sortOption, direction) {
  return state.set('onlineModSort', fromJS([sortOption, direction]))
}
