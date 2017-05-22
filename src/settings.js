import {Map} from 'immutable'

export function setAppSettings (state, settings) {
  return state.set('settings', Map(settings))
}

export function changeAppSetting (state, setting, newValue) {
  return state.setIn(['settings', setting], newValue)
}
