const {shell} = require('electron')

export default store => next => action => {
  if (action.meta && action.meta.isExternalLink) {
    // Currently unsure how to test in mocha because electron API isn't available
    // This is my way of making the tests pass (though it doesn't fully test behavior right now)
    if (shell && shell.openExternal) {
      shell.openExternal(action.link)
    }
  } else {
    return next(action)
  }
}
