import {List, fromJS} from 'immutable'

export function setSaves (state, saves) {
  return state.set('saves', fromJS(saves))
}

export function setActiveSave (state, activeSave) {
  let savesLength = state.get('saves', List()).size

  activeSave = activeSave >= savesLength ? savesLength - 1 : activeSave
  activeSave = activeSave < 0 ? 0 : activeSave

  return state.set('activeSave', activeSave)
}
