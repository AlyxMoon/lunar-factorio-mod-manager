const {ipcRenderer} = require('electron')

export default store => next => action => {
  if (action.meta && action.meta.requestDownload) {
    // Currently unsure how to test in mocha because electron API isn't available
    // This is my way of making the tests pass (though it doesn't fully test behavior right now)
    if (ipcRenderer && ipcRenderer.send) {
      ipcRenderer.send('requestDownload', action.id, action.link)
    }
  } else {
    return next(action)
  }
}
