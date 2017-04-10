// No current use yet, but the following is the code to read the mods used in the save file.

var fs = require('fs')
fs.readFile('level-init.dat', function (error, buffer) {
  if (error) console.log(error)
  else {
    var modCount = buffer.readUIntBE(48, 1)
    for (var i = modCount, pos = 52; i > 0; i--) {
      var length = buffer.readUIntBE(pos, 1)

      var modName = buffer.toString('utf-8', pos, pos + length + 2).trim()
      var vMajor = buffer.readUIntBE(pos + length + 1, 1)
      var vMinor = buffer.readUIntBE(pos + length + 2, 1)
      var vPatch = buffer.readUIntBE(pos + length + 3, 1)

      var fullVersion = 'v' + vMajor + '.' + vMinor + '.' + vPatch

      console.log(modName, fullVersion)

      pos += length + 4
    }
  }
})
