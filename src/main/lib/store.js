import Store from 'electron-store'

const storeFile = new Store({
  defaults: {
    mods: {
      installed: [],
      online: [],
      onlineCount: 0,
      onlineLastFetch: '',
      factorioVersion: '',
    },
    profiles: { list: [], active: null },
    paths: {},
    player: { username: '', token: '' },
    window: {},
  },
})

export default storeFile
