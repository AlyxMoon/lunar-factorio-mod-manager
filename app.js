//---------------------------------------------------------
// Global Variable Declarations
const path = require('path');
const EventEmitter = require('events');

const electron = require('electron');
const app = electron.app;
const appMessager = electron.ipcMain;

const AppManager = require('./lib/applicationManagement.js');
const ModManager = require('./lib/modManager.js');
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

appMessager.on('requestInstalledMods', function(event) {
    logger.log(0, 'Event called: requestInstalledMods');
    if(modManager) event.sender.send('dataInstalledMods', modManager.getInstalledMods());
});
appMessager.on('requestOnlineMods', function(event) {
    logger.log(0, 'Event called: requestOnlineMods');
    if(modManager) event.sender.send('dataOnlineMods', modManager.getOnlineMods());
});
appMessager.on('requestModFetchStatus', function(event) {
    logger.log(0, 'Event called: requestModFetchStatus');
    if(modManager) event.sender.send('dataModFetchStatus', modManager.areOnlineModsFetched(), modManager.getOnlineModFetchedCount(), modManager.getOnlineModCount());
});
appMessager.on('requestPlayerInfo', function(event) {
    logger.log(0, 'Event called: requestPlayerInfo');
    if(modManager) event.sender.send('dataPlayerInfo', modManager.getPlayerUsername());
});
appMessager.on('requestFactorioVersion', function(event) {
    logger.log(0, 'Event called: requestFactorioVersion');
    if(modManager) event.sender.send('dataFactorioVersion', modManager.getFactorioVersion());
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
        mainWindow.webContents.send('dataOnlineMods', modManager.getOnlineMods());
        mainWindow.webContents.send('modsLoadedStatus', finished, page, pageCount);
    }
})
customEvents.on('installedModsLoaded', function() {
    if(mainWindow && modManager) {
        mainWindow.webContents.send('dataInstalledMods', modManager.getInstalledMods());
    }
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
        let baseModPath = path.join(config.game_path, '..', '..', '..', 'data', 'base');
        modManager = new ModManager(config.modlist_path, config.mod_directory_path, baseModPath, config.player_data_path, customEvents);
    }
    catch(error) {
        logger.log(4, `Error creating Mod Manager class. Error: ${error.stack}`);
        app.exit(-1);
    }

    modManager.loadInstalledMods((err) => {
        if(err) {
            logger.log(4, 'Error when loading installed mods');
            app.exit(-1);
        }

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
    modManager.fetchOnlineMods();

}