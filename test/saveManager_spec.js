/* eslint-disable no-unused-expressions */
const {expect} = require('chai')
const path = require('path')
const {fromJS} = require('immutable')

const readSaveFiles = require('../lib/saveManager.js')

describe('Save Manager', () => {
  it('reads mods from the level-init.dat file in the save', done => {
    readSaveFiles(path.join(__dirname, 'data')).then(saveFiles => {
      expect(saveFiles.length).to.equal(2)
      expect(saveFiles[0]).to.equal(fromJS({
        name: 'saveFile_test',
        mods: [{ name: 'base', version: '0.14.19' }]
      }))
      expect(saveFiles[1]).to.equal(fromJS({
        name: 'saveFile_test2',
        mods: [{ name: 'base', version: '0.14.19' }]
      }))

      done()
    }).catch(error => {
      done(error)
    })
  })
})
