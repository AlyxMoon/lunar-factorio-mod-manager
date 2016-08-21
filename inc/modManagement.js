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

    this.loadInstalledMods();
}

//---------------------------------------------------------
// Sending data to the client

ModManager.prototype.sendInstalledMods = function(window) {
    window.webContents.send('dataInstalledMods', this.getInstalledModNames());
};

ModManager.prototype.sendInstalledModInfo = function(window, modName) {

    let mods = this.installedMods;
    for(let i = mods.length - 1; i >= 0; i--) {
        if(mods[i]['name'] === modName) {
            window.webContents.send('dataInstalledModInfo', mods[i]);
            break;
        }
    }
};

//---------------------------------------------------------
// File Management

ModManager.prototype.loadInstalledMods = function() {
    helpers.log('Beginning to load installed mods.');

    let file = require('fs');
    let JSZip = require('jszip');

    let modZipNames = file.readdirSync(this.modDirectoryPath, 'utf8');
    modZipNames.splice(modZipNames.indexOf('mod-list.json'), 1);

    let mods = this.installedMods;

    // Add base mod
    let gamePath = this.gamePath;
    let baseInfo = `${gamePath.substr(0, gamePath.lastIndexOf('Factorio\\bin'))}Factorio/data/base/info.json`;
    mods.push(JSON.parse(file.readFileSync(baseInfo, 'utf8')));

    let counter = modZipNames.length;
    for(let i = 0; i < modZipNames.length; i++) {
        // Open the zip file as a buffer
        file.readFile(`${this.modDirectoryPath}${modZipNames[i]}`, function(error, rawZipBuffer) {
            if(error) throw error;

            // Actually read the zip file
            JSZip.loadAsync(rawZipBuffer).then(function(zip) {
                // Only open the mods info file in the zip
                return zip.file(/info\.json/)[0].async('text');

            }).then(function(modData) {
                // Save the information
                mods.push(JSON.parse(modData));

                // Only show once all zip files have been read
                counter--;
                if(counter <= 0) mods = helpers.sortArrayByProp(mods, 'name');
            });
        });
    }
};

//---------------------------------------------------------
// Helper and Miscellaneous Logic

ModManager.prototype.getFactorioModList = function() {
    helpers.log('Checking for mod list at path: ' + this.modListPath);
    let file = require('fs');

    let data = file.readFileSync(this.modListPath, 'utf8');
    return JSON.parse(data)['mods'];
};

ModManager.prototype.getInstalledModNames = function() {

    return this.installedMods.map(function(mod) {
       return mod['name'];
    });
};