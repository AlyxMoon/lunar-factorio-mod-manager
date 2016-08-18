const helpers = require('./helpers.js');
module.exports = {
    Manager: ModManager
};
//---------------------------------------------------------
// Primary class declaration

// TODO: Make mods be ready before this so they can be provided in constructor
function ModManager(modListPath, modDirectoryPath, gamePath) {

    this.modListPath = modListPath;
    this.modDirectoryPath = modDirectoryPath;
    this.gamePath = gamePath;
    this.installedMods = [];
    this.installedModsNames = [];

}

//---------------------------------------------------------
// Sending data to the client

ModManager.prototype.sendInstalledMods = function(window) {
    window.webContents.send('dataInstalledMods', this.installedModsNames);
};

//---------------------------------------------------------
// File Management

// Failed to get this to work with current implementation. That'll be fixed eventually.
//ModManager.prototype.loadInstalledMods = function() {
//};


//---------------------------------------------------------
// Helper and Miscellaneous Logic

ModManager.prototype.getFactorioModList = function() {
    helpers.log('Checking for mod list at path: ' + this.modListPath);
    let file = require('fs');

    let data = file.readFileSync(this.modListPath, 'utf8');
    return JSON.parse(data)['mods'];
};