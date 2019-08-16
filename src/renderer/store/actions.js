import { ipcRenderer } from 'electron'

export const startFactorio = (context) => {
  ipcRenderer.send('START_FACTORIO')
}

export const setActiveProfile = (context, index) => {
  ipcRenderer.send('SET_ACTIVE_PROFILE', Number(index))
}
