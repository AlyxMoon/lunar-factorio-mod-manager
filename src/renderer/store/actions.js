import { ipcRenderer } from 'electron'

export const startFactorio = (context) => {
  ipcRenderer.send('START_FACTORIO')
}
