const helpers = require('./helpers.js');

module.exports = {

    showInstalledMods: function(window, mods) {
        window.webContents.send('dataInstalledMods', mods);
    }

};