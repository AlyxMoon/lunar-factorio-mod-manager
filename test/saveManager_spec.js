/* eslint-disable no-unused-expressions */
const {expect} = require('chai')
const path = require('path')

import SaveManager from '../lib/saveManager.js'

describe('Save Manager', () => {
  it('reads mods from the level-init.dat file in the save', done => {
    let savesPath = path.join(__dirname, 'data')
    const saveManager = new SaveManager()
    saveManager.readSaveFiles(savesPath).then(saveFiles => {
      expect(saveFiles.length).to.equal(2)
      expect(saveFiles[0]).to.eql({
        name: 'saveFile_test',
        mods: [{ name: 'base', version: '0.14.19' }]
      })
      expect(saveFiles[1]).to.eql({
        name: 'saveFile_test2',
        mods: [{ name: 'base', version: '0.14.19' }]
      })

      done()
    }).catch(error => {
      done(error)
    })
  })
})
