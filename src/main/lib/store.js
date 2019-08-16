import Store from 'electron-store'

const storeFile = new Store({
  defaults: {
    mods: { installed: [] },
    profiles: { list: [], active: null },
    paths: {},
    window: {},
  },
})

export default storeFile
