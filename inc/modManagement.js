const helpers = require('./helpers.js');

module.exports = {

    getFactorioModList: function(filePath) {
        helpers.log('Checking for mod list at path: ' + filePath);
        let file = require('fs');

        let data = file.readFileSync(filePath, 'utf8');
        return JSON.parse(data)['mods'];
    },

    showInstalledMods: function(window, mods) {
        window.webContents.send('dataInstalledMods', mods);
    }

};