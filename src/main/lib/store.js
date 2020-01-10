import Store from 'electron-store'
import models from '@shared/models'

const storeFile = new Store({
  schema: models,
})

export default storeFile
