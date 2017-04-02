const {ipcRenderer} = require('electron')

export default store => next => action => {
  if (action.meta && action.meta.sendToMain) {
    // Currently unsure how to test in mocha because electron API isn't available
    // This is my way of making the tests pass (though it doesn't fully test behavior right now)
    if (ipcRenderer && ipcRenderer.send) {
      switch (action.type) {
        case 'SET_ACTIVE_PROFILE':
          ipcRenderer.send('activateProfile', action.activeProfile)
          break
        case 'ADD_PROFILE':
          ipcRenderer.send('newProfile')
          break
        case 'RENAME_PROFILE':
          ipcRenderer.send('renameProfile', action.index, action.name)
          break
        case 'DELETE_PROFILE':
          ipcRenderer.send('deleteProfile', action.index)
          break
        case 'MOVE_PROFILE_UP':
          ipcRenderer.send('sortProfile', action.index, 'up')
          break
        case 'MOVE_PROFILE_DOWN':
          ipcRenderer.send('sortProfile', action.index, 'down')
          break
        case 'TOGGLE_MOD_STATUS':
          ipcRenderer.send('toggleMod', action.profileIndex, action.modIndex)
          break

        case 'DELETE_INSTALLED_MOD':
          ipcRenderer.send('deleteMod', action.index)
          break

        case 'REQUEST_DOWNLOAD':
          ipcRenderer.send('requestDownload', action.id, action.link)
          break
      }
    }
  }
  return next(action)
}
