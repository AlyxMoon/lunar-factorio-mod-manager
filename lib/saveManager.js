const fs = require('fs')
const path = require('path')
const JSZip = require('jszip')
const {fromJS} = require('immutable')

module.exports = readSaveFiles

function readSaveFiles (saveDirectory) {
  return new Promise((resolve, reject) => {
    fs.readdir(saveDirectory, (error, saveFiles) => {
      if (error) reject(error)
      if (saveFiles.length === 0) resolve()

      const saveFilePromises = saveFiles.map(file => {
        return new Promise((resolve, reject) => {
          if (file.slice(-4) !== '.zip') resolve()

          let folderName = path.basename(file, '.zip')
          let fileName = 'level-init.dat'

          fs.readFile(path.join(saveDirectory, file), (error, rawZipBuffer) => {
            if (error) reject(error)

            JSZip.loadAsync(rawZipBuffer).then(zip => {
              return zip.folder(folderName).file(fileName).async('nodebuffer')
            }).catch(error => {
              reject(error)
            }).then(levelData => {
              const saveData = fromJS({
                name: folderName,
                mods: parseSaveFileLevelData(levelData)
              })

              resolve(saveData)
            }).catch(error => {
              reject(error)
            })
          })
        })
      })

      Promise.all(saveFilePromises).then(data => {
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  })

  function parseSaveFileLevelData (saveFile) {
    let mods = []
    let modCount = saveFile.readUIntBE(48, 1)
    for (var i = modCount, pos = 52; i > 0; i--) {
      let length = saveFile.readUIntBE(pos, 1)

      let modName = saveFile.toString('utf-8', pos + 1, pos + length + 1).trim()
      let vMajor = saveFile.readUIntBE(pos + length + 1, 1)
      let vMinor = saveFile.readUIntBE(pos + length + 2, 1)
      let vPatch = saveFile.readUIntBE(pos + length + 3, 1)

      let fullVersion = vMajor + '.' + vMinor + '.' + vPatch

      mods.push({ name: modName, version: fullVersion })
      pos += length + 4
    }
    return mods
  }
}
