import { ipcRenderer } from 'electron'
import { debounce } from 'src/shared/debounce'

export const startFactorio = (context) => {
  ipcRenderer.send('START_FACTORIO')
}

export const setActiveProfile = (context, index) => {
  ipcRenderer.send('SET_ACTIVE_PROFILE', Number(index))
}

export const addModToCurrentProfile = (context, mod) => {
  ipcRenderer.send('ADD_MOD_TO_CURRENT_PROFILE', mod)
}

export const removeModFromCurrentProfile = (context, mod) => {
  ipcRenderer.send('REMOVE_MOD_FROM_CURRENT_PROFILE', mod)
}

export const addProfile = (context) => {
  ipcRenderer.send('ADD_PROFILE')
}

export const updateCurrentProfile = debounce((context, data) => {
  const profile = Object.assign({ ...context.getters.currentProfile() }, data)
  ipcRenderer.send('UPDATE_CURRENT_PROFILE', profile)
})

export const toggleEditProfile = (context) => {
  context.commit('TOGGLE_EDIT_PROFILE')
}

export const removeCurrentProfile = (context) => {
  ipcRenderer.send('REMOVE_CURRENT_PROFILE')
}

export const selectMod = (context, mod) => {
  context.commit('SET_SELECTED_MOD', { selectedMod: mod })
}
