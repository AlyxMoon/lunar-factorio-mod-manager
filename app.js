//---------------------------------------------------------
// Global Variable Declarations
const EventEmitter = require('events');

const electron = require('electron');
const app = electron.app;
const appMessager = electron.ipcMain;

const AppManager = require('./lib/applicationManagement.js');
const ModManager = require('./lib/modManagement.js');
const ProfileManager = require('./lib/profileManagement.js');
const logger = require('./lib/logger.js');

let appManager;
let mainWindow;
let profileManager;
let modManager;
let customEvents = new EventEmitter();
//---------------------------------------------------------
//---------------------------------------------------------
// Event listeners for application-related messages

app.on('ready', init);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        appManager.closeProgram(app, profileManager);
    }
});
app.on('activate', function () {
    if (mainWindow === null) {
        mainWindow = appManager.createWindow();
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
appMessager.on('requestModFetchStatus', function() {
    modManager.sendModFetchStatus(mainWindow);
});
appMessager.on('requestPlayerInfo', function() {
    modManager.sendPlayerInfo(mainWindow);
});
appMessager.on('requestFactorioVersion', function() {
    modManager.sendFactorioVersion(mainWindow);
});
appMessager.on('requestAppVersion', function() {
    appManager.sendAppVersion(mainWindow);
});

appMessager.on('requestAllProfiles', function() {
    profileManager.sendAllProfiles(mainWindow);
});
appMessager.on('requestActiveProfile', function() {
    profileManager.sendActiveProfile(mainWindow);
});

appMessager.on('requestAppConfig', function() {
    appManager.sendAppConfig(mainWindow);
});

appMessager.on('newProfile', function() {
    try {
        profileManager.createProfile(modManager.getInstalledModNames());
        profileManager.sendAllProfiles(mainWindow);
    }
    catch(error) {
        logger.log(4, `Error when creating new profile: ${error}`);
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
        logger.log(4, `Error when activating a profile: ${error}`);
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
        logger.log(4, `Error when renaming a profile: ${error}`);
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
        logger.log(4, `Error when deleting a profile: ${error}`);
        app.exit(-1);
    }
});
appMessager.on('sortProfile', function(event, direction) {
    try {
        profileManager.moveActiveProfile(direction);
        profileManager.sendAllProfiles(mainWindow);
    }
    catch(error) {
        logger.log(4, `Error when sorting a profile: ${error}`);
        app.exit(-1);
    }
});
appMessager.on('toggleMod', function(event, modName) {
    try {
        profileManager.toggleMod(modName);
    }
    catch(error) {
        logger.log(4, `Error when togging a mod: ${error}`);
        app.exit(-1);
    }
});

appMessager.on('requestInstalledModInfo', function(event, modName) {
    try {
        modManager.sendInstalledModInfo(mainWindow, modName);
    }
    catch(error) {
        logger.log(4, `Error when sending installed mod info: ${error}`);
        app.exit(-1);
    }

});
appMessager.on('requestOnlineModInfo', function(event, modName) {
    try {
        modManager.sendOnlineModInfo(mainWindow, modName);
    }
    catch(error) {
        logger.log(4, `Error when requesting online mod info: ${error}`);
        app.exit(-1);
    }
});
appMessager.on('requestDownload', function(event, modID, modName) {
    try {
        modManager.initiateDownload(mainWindow, modID, modName);
    }
    catch(error) {
        logger.log(4, `Error when downloading a mod: ${error}`);
        app.exit(-1);
    }
});

appMessager.on('startGame', function() {
    try {
        appManager.startGame(app, profileManager);
    }
    catch(error) {
        logger.log(4, `Error when starting Factorio: ${error}`);
        app.exit(-1);
    }
});
appMessager.on('changePage', function(event, newPage) {
    try {
        appManager.loadPage(mainWindow, newPage, profileManager, modManager);
    }
    catch(error) {
        logger.log(4, `Error when changing the page: ${error}`);
        app.exit(-1);
    }
});
appMessager.on('updateConfig', function(event, data) {
    appManager.config = data;
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


    let screenSize = electron.screen.getPrimaryDisplay().workAreaSize;

    try {
        appManager = new AppManager(`${__dirname}/data/lmm_config.json`);
    }
    catch(error) {
        logger.log(4, `Error initializating App Manager. Error: ${error.message}`);
        app.exit(-1);
    }

    let config = appManager.loadConfig(electron, screenSize.width, screenSize.height);
    if(!config) app.exit(-1);

    try {
        modManager = new ModManager(config.modlist_path, config.mod_directory_path, config.game_path, config.player_data_path, customEvents);
    }
    catch(error) {
        logger.log(4, `Error creating Mod Manager class. Error: ${error.stack}`);
        app.exit(-1);
    }

    customEvents.once('installedModsLoaded', function(event) {
        logger.log(1, 'Installed mods are loaded.');
        try {
            profileManager = new ProfileManager(`${__dirname}/data/lmm_profiles.json`, config.modlist_path);
        }
        catch(error) {
            logger.log(4, `Error creating Profile Manager class. Error: ${error.message}`);
            app.exit(-1);
        }

        try {
            mainWindow = appManager.createWindow(screenSize.width, screenSize.height);
        }
        catch(error) {
            logger.log(4, `Error creating the window. Error: ${error.message}`);
            app.exit(-1);
        }

        mainWindow.webContents.session.on('will-download', function(event, item, webContents) {
            modManager.manageDownload(item, webContents, profileManager);
        });
        mainWindow.on('resize', function(event) {
            let newSize = mainWindow.getSize();
            appManager.config.width = newSize[0];
            appManager.config.height = newSize[1];
        });
        mainWindow.on('move', function(event) {
            let newLoc = mainWindow.getPosition();
            appManager.config.x_loc = newLoc[0];
            appManager.config.y_loc = newLoc[1];
        });


        profileManager.updateProfilesWithNewMods(modManager.getInstalledModNames());
        profileManager.removeDeletedMods(modManager.getInstalledModNames());
        appManager.loadPage(mainWindow, 'page_profiles', profileManager, modManager);
    });

    modManager.loadPlayerData();
    modManager.loadInstalledMods();
    modManager.fetchOnlineMods();

}