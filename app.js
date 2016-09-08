//---------------------------------------------------------
// Global Variable Declarations

const electron = require('electron');
const app = electron.app;
const appMessager = electron.ipcMain;

const EventEmitter = require('events');
let customEvents = new EventEmitter();

const AppManager = require('./inc/applicationManagement.js');
let appManager = new AppManager.Manager(`${__dirname}/lmm_config.json`);

let mainWindow;
let profileManager;
let modManager;
let config;

const helpers = require('./inc/helpers.js');

//---------------------------------------------------------
//---------------------------------------------------------
// Event listeners for application-related messages

app.on('ready', init);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        appManager.closeProgram(app, config, profileManager);
    }
});
app.on('activate', function () {
    if (mainWindow === null) {
        mainWindow = appManager.createWindow(config);
    }
});

//---------------------------------------------------------
//---------------------------------------------------------
// Event listeners for client messages

appMessager.on('requestInstalledMods', function() {
    modManager.sendInstalledMods(mainWindow);
});
appMessager.on('requestOnlineMods', function() {
    modManager.sendOnlineMods(mainWindow);
});
appMessager.on('areModsLoaded', function() {
    modManager.sendModLoadStatus(mainWindow);
});
appMessager.on('requestPlayerInfo', function() {
    modManager.sendPlayerInfo(mainWindow);
});
appMessager.on('requestFactorioVersion', function() {
    modManager.sendFactorioVersion(mainWindow);
});

appMessager.on('newProfile', function() {
    try {
        profileManager.createProfile(modManager.getInstalledModNames());
        profileManager.sendAllProfiles(mainWindow);
    }
    catch(error) {
        helpers.log(`Error when creating new profile: ${error}`);
        app.exit(-1);
    }
});
appMessager.on('activateProfile', function(event, profileName) {
    try {
        profileManager.activateProfile(profileName);
        profileManager.sendAllProfiles(mainWindow);
        profileManager.sendActiveProfile(mainWindow);
    }
    catch(error) {
        helpers.log(`Error when activating a profile: ${error}`);
        app.exit(-1);
    }
});
appMessager.on('renameProfile', function(event, newName) {
    try {
        profileManager.renameActiveProfile(newName);
        profileManager.sendAllProfiles(mainWindow);
        profileManager.sendActiveProfile(mainWindow);
    }
    catch(error) {
        helpers.log(`Error when renaming a profile: ${error}`);
        app.exit(-1);
    }
});
appMessager.on('deleteProfile', function() {
    try {
        profileManager.deleteActiveProfile(modManager.getInstalledModNames());
        profileManager.sendAllProfiles(mainWindow);
        profileManager.sendActiveProfile(mainWindow);
    }
    catch(error) {
        helpers.log(`Error when deleting a profile: ${error}`);
        app.exit(-1);
    }
});
appMessager.on('sortProfile', function(event, direction) {
    try {
        profileManager.moveActiveProfile(direction);
        profileManager.sendAllProfiles(mainWindow);
    }
    catch(error) {
        helpers.log(`Error when sorting a profile: ${error}`);
        app.exit(-1);
    }
});
appMessager.on('toggleMod', function(event, modName) {
    try {
        profileManager.toggleMod(modName);
    }
    catch(error) {
        helpers.log(`Error when togging a mod: ${error}`);
        app.exit(-1);
    }
});

appMessager.on('requestInstalledModInfo', function(event, modName) {
    try {
        modManager.sendInstalledModInfo(mainWindow, modName);
    }
    catch(error) {
        helpers.log(`Error when sending installed mod info: ${error}`);
        app.exit(-1);
    }

});
appMessager.on('requestOnlineModInfo', function(event, modName) {
    try {
        modManager.sendOnlineModInfo(mainWindow, modName);
    }
    catch(error) {
        helpers.log(`Error when requesting online mod info: ${error}`);
        app.exit(-1);
    }
});
appMessager.on('requestDownload', function(event, modID, modName) {
    try {
        modManager.initiateDownload(mainWindow, modID, modName);
    }
    catch(error) {
        helpers.log(`Error when downloading a mod: ${error}`);
        app.exit(-1);
    }
});

appMessager.on('startGame', function() {
    try {
        appManager.startGame(app, config, profileManager);
    }
    catch(error) {
        helpers.log(`Error when starting Factorio: ${error}`);
        app.exit(-1);
    }
});
appMessager.on('changePage', function(event, newPage) {
    try {
        appManager.loadPage(mainWindow, newPage, profileManager, modManager);
    }
    catch(error) {
        helpers.log(`Error when changing the page: ${error}`);
        app.exit(-1);
    }
});

customEvents.on('onlineModsLoaded', function(finished, page, pageCount) {
    if(mainWindow && modManager) {
        modManager.sendOnlineMods(mainWindow);
        mainWindow.webContents.send('modsLoadedStatus', finished, page, pageCount);
    }
})
customEvents.on('installedModsLoaded', function() {
    if(mainWindow && modManager) modManager.sendInstalledMods(mainWindow);
});

//---------------------------------------------------------
//---------------------------------------------------------
// Application management functions

function init() {
    let ModManager = require('./inc/modManagement.js');
    let ProfileManager = require('./inc/profileManagement.js');

    let screenSize = electron.screen.getPrimaryDisplay().workAreaSize;

    config = appManager.loadConfig(electron.dialog, screenSize.width, screenSize.height);
    if(!config) {
        app.quit();
    }

    try {
        modManager = new ModManager.Manager(config.modlist_path, config.mod_directory_path, config.game_path, customEvents);
    }
    catch(error) {
        helpers.log(`Error creating Mod Manager class. Error: ${error.message}`);
        app.quit();
    }

    try {
        profileManager = new ProfileManager.Manager(`${__dirname}/lmm_profiles.json`, config.modlist_path);
    }
    catch(error) {
        helpers.log(`Error creating Profile Manager class. Error: ${error.message}`);
        app.quit();
    }


    try {
        mainWindow = appManager.createWindow(config);
    }
    catch(error) {
        helpers.log(`Error creating the window. Error: ${error.message}`);
        app.quit();
    }

    mainWindow.webContents.session.on('will-download', function(event, item, webContents) {
        modManager.manageDownload(item, webContents, profileManager);
    });

    customEvents.once('installedModsLoaded', function(event) {
        profileManager.updateProfilesWithNewMods(modManager.getInstalledModNames());
        profileManager.removeDeletedMods(modManager.getInstalledModNames());
        appManager.loadPage(mainWindow, 'page_profiles', profileManager, modManager);
    });

}