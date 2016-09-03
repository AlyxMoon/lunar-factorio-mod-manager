//---------------------------------------------------------
// Global Variable Declarations

const electron = require('electron');
const app = electron.app;
const appMessager = electron.ipcMain;

const EventEmitter = require('events');
let customEvents = new EventEmitter();

const AppManager = require('./inc/applicationManagement.js');
let appManager = new AppManager.Manager();

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
        profileManager.deleteActiveProfile();
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
    try {
        helpers.log('Beginning initialization of app.');
        let file = require('fs');
        let configPath = `${__dirname}/lmm_config.json`;
        let profilesPath = `${__dirname}/lmm_profiles.json`;

        let data;
        try {
            data = file.readFileSync(configPath, 'utf8');
            config = JSON.parse(data);
            file.readFileSync(profilesPath, 'utf8');

            config['config-path'] = configPath;
            config['profiles-path'] = profilesPath;

            helpers.log('Found config and profiles file, loaded successfully.');
            startProgram();
        }
        catch(error) {
            if(error.code === 'ENOENT') {
                helpers.log('Was not able to find config or profiles file.');
                createAppFiles();
            }
        }
    }
    catch(error) {
        helpers.log(`Uncaught error during app initialization: ${error}`);
        app.exit(-1);
    }


}

function startProgram() {
    try {
        helpers.log('Starting the app now.');

        // Only initialize if it wasn't created in the createAppFiles function
        try{
            if(!modManager) {
                let ModManager = require('./inc/modManagement.js');
                modManager = new ModManager.Manager(config['modlist-path'], config['mod-path'], config['game-path'], customEvents);
            }
        }
        catch(error){
            helpers.log('Error: ' + error);
        }

        let ProfileManager = require('./inc/profileManagement.js');
        profileManager = new ProfileManager.Manager(config['profiles-path'], config['modlist-path']);

        mainWindow = appManager.createWindow(config);
        mainWindow.webContents.session.on('will-download', function(event, item, webContents) {
            modManager.manageDownload(item, webContents, profileManager);
        });

        customEvents.once('installedModsLoaded', function(event) {
            profileManager.updateProfilesWithNewMods(modManager.getInstalledModNames());
            profileManager.removeDeletedMods(modManager.getInstalledModNames());
            appManager.loadPage(mainWindow, 'page_profiles', profileManager, modManager);
        });
    }
    catch(error) {
        helpers.log(`Uncaught error during app startup: ${error}`);
        app.exit(-1);
    }
}

function createAppFiles() {
    try {
        helpers.log('Beginning to create config and profiles files.');
        let file = require('fs');
        let configPath = `${__dirname}/lmm_config.json`;
        let profilesPath = `${__dirname}/lmm_profiles.json`;

        let screenSize = electron.screen.getPrimaryDisplay().workAreaSize;
        let data = {
            'minWidth': screenSize.width / 2,
            'minHeight': screenSize.height / 1.25,
            'width': screenSize.width / 2,
            'height': screenSize.height,
            'x-loc': 0,
            'y-loc': 0,
            'mod-path': '',
            'modlist-path': '',
            'game-path': ''
        };

        let modPath = appManager.promptForModlist(electron.dialog);
        if(modPath === undefined) {
            helpers.log('User cancelled the dialog search.');
            appManager.closeProgram(app, config, profileManager, true);
        }
        else if(modPath.indexOf('mod-list.json') === -1) {
            helpers.log('The selected file was not correct. Closing app.');
            appManager.closeProgram(app, config, profileManager, true);
        }

        let gamePath = appManager.promptForGamePath(electron.dialog);
        if(gamePath === undefined) {
            helpers.log('User cancelled the dialog search.');
            appManager.closeProgram(app, config, profileManager, true);
        }
        else if(gamePath.indexOf('factorio.exe') === -1) {
            helpers.log('The selected file was not correct. Closing app.');
            appManager.closeProgram(app, config, profileManager, true);
        }

        data['modlist-path'] = modPath;
        data['mod-path'] = modPath.slice(0,modPath.indexOf('mod-list.json'));
        data['game-path'] = gamePath;

        try {
            let ModManager = require('./inc/modManagement.js');
            modManager = new ModManager.Manager(data['modlist-path'], data['mod-path'], data['game-path'], customEvents);

            file.writeFileSync(configPath, JSON.stringify(data));
            config = data;

            helpers.log('Successfully created config file, now creating profile');
            try {
                let profile = [{
                    'name': 'Current Profile',
                    'enabled': true,
                    'mods': modManager.getFactorioModList()

                }];
                helpers.log('About to write new profiles file');
                file.writeFileSync(profilesPath, JSON.stringify(profile));
            }
            catch(error) {
                helpers.log('Failed to write profile file on first time initialization, error: ' + error.code);
                appManager.closeProgram(app, config, profileManager, true);
            }
            helpers.log('Successfully created first profile');
            config['config-path'] = configPath;
            config['profiles-path'] = profilesPath;
            startProgram();
        }
        catch(error) {
            helpers.log('Failed to write config on first time initialization, error: ' + error.code);
            appManager.closeProgram(app, config, profileManager, true);
        }
    }
    catch(error) {
        helpers.log(`Uncaught error creating application files: ${error}`);
        app.exit(-1);
    }
}
//---------------------------------------------------------