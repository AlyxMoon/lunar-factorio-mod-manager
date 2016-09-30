const fs = require('fs');
const path = require('path');
const request = require('request');
const JSZip = require('jszip');

const logger = require('./logger.js');
const helpers = require('./helpers.js');

module.exports = ModManager;
//---------------------------------------------------------
// Primary class declaration

// TODO: Make mods be ready before this so they can be provided in constructor
function ModManager(modListPath, modDirectoryPath, gamePath, playerDataPath, customEvents) {

    this.modListPath = modListPath;
    this.modDirectoryPath = modDirectoryPath;
    this.gamePath = gamePath;
    this.playerDataPath = playerDataPath;
    this.factorioVersion = '';
    this.installedMods = [];

    this.customEvents = customEvents;

    this.onlineMods = [];
    this.onlineModsFetched = false;
    this.onlineModTotalCount = 0; // Total number of mods in the mod portal
    this.onlineModFetchedCount = 0; // The number of mods fetched so far, used for progress indicator

    this.playerUsername = '';
    this.playerToken = '';

}

//---------------------------------------------------------
// Sending data to the client

ModManager.prototype.sendInstalledMods = function(window) {
    window.webContents.send('dataInstalledMods', this.installedMods);
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

ModManager.prototype.sendOnlineMods = function(window) {
   window.webContents.send('dataOnlineMods', this.onlineMods);
}

ModManager.prototype.sendOnlineModInfo = function(window, modName) {

    let mods = this.onlineMods;
    for(let i = mods.length - 1; i >= 0; i--) {
       if(mods[i]['name'] === modName) {
           window.webContents.send('dataOnlineModInfo', mods[i]);
           break;
       }
    }
};

ModManager.prototype.sendModFetchStatus = function(window) {
    window.webContents.send('dataModFetchStatus', this.onlineModsFetched, this.onlineModFetchedCount, this.onlineModTotalCount);
}

ModManager.prototype.sendFactorioVersion = function(window) {
    // Couldn't get event listener to set version working in the class constructor, this is my workaround
    if(this.factorioVersion === '') this.getFactorioVersion();
    window.webContents.send('dataFactorioVersion', this.factorioVersion);
};

ModManager.prototype.sendPlayerInfo = function(window) {
    window.webContents.send('dataPlayerInfo', this.playerUsername);
};

//---------------------------------------------------------
// File Management

ModManager.prototype.loadInstalledMods = function() {

    let modZipNames = fs.readdirSync(this.modDirectoryPath, 'utf8');
    modZipNames = modZipNames.filter(function(elem) {
        return elem.slice(-4) === ".zip";
    });

    this.installedMods = [];
    let mods = this.installedMods;
    let events = this.customEvents;

    // Add base mod
    let baseInfoPath = path.join(this.gamePath, '..', '..', '..', 'data', 'base', 'info.json');
    let baseInfo;
    try {
        baseInfo = fs.readFileSync(baseInfoPath, 'utf8');
        mods.push(JSON.parse(baseInfo));
    }
    catch(error) {
        if(error.code === 'ENOENT') {
            logger.log(3, 'Path to base mod incorrect. If you wish to help the app, please file a report with the directory of the Factorio base mod.');
            logger.log(3, `App attempted to find base mod at: ${baseInfoPath}`);
        }
        else logger.log(3, `Unhandled error while loading base mod. Error: ${error.message}`);
    }

    if(modZipNames.length > 0) {
        let counter = modZipNames.length;
        for(let i = 0; i < modZipNames.length; i++) {
            // Open the zip file as a buffer
            fs.readFile(`${this.modDirectoryPath}${modZipNames[i]}`, function(error, rawZipBuffer) {
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
                    if(counter <= 0) {
                        mods = helpers.sortArrayByProp(mods, 'name');
                        events.emit('installedModsLoaded');
                    }
                });
            });
        }
    }
    else {
        logger.log(1, 'No installed mods were found.');
        events.emit('installedModsLoaded'); // No mods are actually loaded besides base
    }


};

ModManager.prototype.loadPlayerData = function() {
    let data = fs.readFileSync(this.playerDataPath, 'utf8');
    data = JSON.parse(data);

    if('service-username' in data && 'service-token' in data) {
        this.playerUsername = data['service-username'];
        this.playerToken = data['service-token'];
    }
};

//---------------------------------------------------------
// Online Mod Management

// window is an optional argument, if given will send data once loaded
ModManager.prototype.fetchOnlineMods = function() {
    logger.log(1, 'Beginning to fetch online mods.');
    let self = this; // Required to get class variables working properly in nested functions
    self.onlineMods = [];
    self.onlineModsFetched = false;
    self.onlineModTotalCount = 0;
    self.onlineModFetchedCount = 0;

    let apiURL = 'https://mods.factorio.com/api/mods';
    let options = '?page_size=20';

    fetchOnlineModInfo(`${apiURL}${options}`, (error) => {
        if(error) {
            self.onlineMods = [];
            logger.log(3, 'Error when fetching mods from the online mod portal. Continuing without any related functionality.', error);
        }
        else {
            self.onlineModsFetched = true;
            logger.log(1, 'All online mods were successfully fetched.');
        }
    });

    function fetchOnlineModInfo(url, callback) {
       request(url, (error, response, data) => {
           if(!error && response.statusCode === 200) {
               data = JSON.parse(data);
               self.onlineModTotalCount = data.pagination.count;

               for(let i = 0; i < data['results'].length; i++) {
                   fetchFullOnlineMod(`${apiURL}/${data.results[i].name}`, (error) => {
                       if(error) return callback(error);
                       if(self.onlineModFetchedCount >= self.onlineModTotalCount) return callback(null);
                   });
               }

               if(data['pagination']['links']['next']) {
                   fetchOnlineModInfo(data['pagination']['links']['next'], callback);
               }
           }
           else {
               return callback(error);
           }

       });
    }

    function fetchFullOnlineMod(url, callback) {
        request(url, (error, response, data) => {
            if(!error && response.statusCode === 200) {
                self.onlineMods.push(JSON.parse(data));
                self.onlineModFetchedCount++;
                return callback(null);
            }
            else {
                return callback(error);
            }
        });
    }
};

ModManager.prototype.initiateDownload = function(window, modID, downloadLink) {
    if(!this.playerUsername || !this.playerToken) {
        return;
    }

    let mods = this.onlineMods;
    let modToDownload;
    let updateMod = false;

    for(let i = mods.length - 1; i >= 0; i--) {
       if(mods[i]['id'] == modID) {
           window.webContents.send('ping', mods[i]);
           modToDownload = mods[i];
           break;
       }
    }

    // If already installed, we're updating and need to delete the existing zip file
    for(let j = this.installedMods.length - 1; j >= 0; j--) {
        if(this.installedMods[j].name === modToDownload.name) {
            logger.log(0, 'Mod does indeed exist');
            this.customEvents.once('modDownloaded', (profileManager) => {
                let name = this.installedMods[j].name;
                let version = this.installedMods[j].version;

                fs.unlinkSync(`${this.modDirectoryPath}/${name}_${version}.zip`);
                logger.log(1, 'Deleted mod at: ' + `${this.modDirectoryPath}/${name}_v${version}.zip`);

                this.loadInstalledMods(() => {
                    profileManager.updateProfilesWithNewMods(this.getInstalledModNames());
                });
            });
            break;
        }
    }

    logger.log(1, `Attempting to download mod: ${modToDownload.name}`);
    let downloadURL = `https://mods.factorio.com${downloadLink}?username=${this.playerUsername}&token=${this.playerToken}`;
    window.webContents.send('ping', downloadURL);

    window.webContents.send('dataModDownloadStatus', "starting", modToDownload.name);
    window.webContents.downloadURL(downloadURL);
};

ModManager.prototype.manageDownload = function(item, webContents, profileManager) {
   // Set the save path, making Electron not to prompt a save dialog.
   item.setSavePath(`${this.modDirectoryPath}/${item.getFilename()}`);

   //Path seems correct, and directory is created if doesn't exist in correct place, but
   // download is frozen if I use this. TODO: Figure it out
   //item.setSavePath(`${__dirname}/../data/${item.getFilename()}`);


   item.on('updated', (event, state) => {
        if (state === 'interrupted') {
            logger.log(0, 'Download is interrupted but can be resumed')
        }
        else if (state === 'progressing') {
            if (item.isPaused()) {
                logger.log(0, 'Download is paused');
            }
            else {
                logger.log(0, `Received bytes: ${item.getReceivedBytes()}`);
            }
        }
    });

   item.once('done', (event, state) => {
       if (state === 'completed') {
           logger.log(1, 'Downloaded mod successfully');
           webContents.send('dataModDownloadStatus', "finished");
           if(!this.customEvents.emit('modDownloaded', profileManager)) {
               this.loadInstalledMods(() => {
                   profileManager.updateProfilesWithNewMods(this.getInstalledModNames());
               });
           }
       } else {
           logger.log(2, `Download failed: ${state}`);
       }
   });
};

//---------------------------------------------------------
// Helper and Miscellaneous Logic

ModManager.prototype.getFactorioModList = function() {
    logger.log(1, 'Checking for mod list at path: ' + this.modListPath);

    let data = fs.readFileSync(this.modListPath, 'utf8');
    return JSON.parse(data)['mods'];
};

ModManager.prototype.getFactorioVersion = function() {
    let mods = this.installedMods;

    for(let i = 0; i < mods.length; i++) {
        if(mods[i].name === 'base') {
            let version = mods[i].version;
            // Factorio version check logic doesn't care about patch version
            this.factorioVersion = version.slice(0, version.lastIndexOf('.'));
            break;
        }
    }
}

ModManager.prototype.getInstalledModNames = function() {

    return this.installedMods.map(function(mod) {
       return mod['name'];
    });
};