import {fromJS} from 'immutable'

export function setSaves (state, saves) {
  return state.set('saves', fromJS(saves))
}
