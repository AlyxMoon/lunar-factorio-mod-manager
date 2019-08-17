import { ipcRenderer } from 'electron'

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
