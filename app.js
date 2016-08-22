//---------------------------------------------------------
// Global Variable Declarations

const electron = require('electron');
const app = electron.app;
let mainWindow;
let profileManager;
let modManager;
let config;

const helpers = require('./inc/helpers.js');
const appManager = require('./inc/applicationManagement.js');


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

electron.ipcMain.on('newProfile', function() {
    profileManager.createProfile(modManager.getInstalledModNames());
    profileManager.sendAllProfiles(mainWindow);
});
electron.ipcMain.on('activateProfile', function(event, profileName) {
    profileManager.activateProfile(profileName);
    profileManager.sendAllProfiles(mainWindow);
    profileManager.sendActiveProfile(mainWindow);
});
electron.ipcMain.on('renameProfile', function(event, newName) {
    profileManager.renameActiveProfile(newName);
    profileManager.sendAllProfiles(mainWindow);
    profileManager.sendActiveProfile(mainWindow);
});
electron.ipcMain.on('deleteProfile', function() {
    profileManager.deleteActiveProfile();
    profileManager.sendAllProfiles(mainWindow);
    profileManager.sendActiveProfile(mainWindow);
});
electron.ipcMain.on('sortProfile', function(event, direction) {
    profileManager.moveActiveProfile(direction);
    profileManager.sendAllProfiles(mainWindow);
});
electron.ipcMain.on('toggleMod', function(event, modName) {
    profileManager.toggleMod(modName);
});

electron.ipcMain.on('requestInstalledModInfo', function(event, modName) {
    modManager.sendInstalledModInfo(mainWindow, modName);
});
electron.ipcMain.on('requestOnlineModInfo', function(event, modName) {
    modManager.sendOnlineModInfo(mainWindow, modName);
});
electron.ipcMain.on('requestDownload', function(event, modID) {
    modManager.initiateDownload(mainWindow, modID);
});

electron.ipcMain.on('startGame', function() {
    appManager.startGame(app, config, profileManager);
});
electron.ipcMain.on('changePage', function(event, newPage) {
    appManager.loadPage(mainWindow, newPage, profileManager, modManager);
});

//---------------------------------------------------------
//---------------------------------------------------------
// Application management functions

function init() {
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

function startProgram() {
    helpers.log('Starting the app now.');
    let ProfileManager = require('./inc/profileManagement.js');
    profileManager = new ProfileManager.Manager(config['profiles-path'], config['modlist-path']);

    // Only initialize if it wasn't created in the createAppFiles function
    try{
        if(!modManager) {
            let ModManager = require('./inc/modManagement.js');
            modManager = new ModManager.Manager(config['modlist-path'], config['mod-path'], config['game-path']);
        }
    }
    catch(error){
        helpers.log('Error: ' + error);
    }

    profileManager.updateProfilesWithNewMods(modManager.getInstalledModNames());

    mainWindow = appManager.createWindow(config);
    mainWindow.webContents.session.on('will-download', function(event, item, webContents) {
        modManager.manageDownload(item, webContents, profileManager);
    });
    appManager.loadPage(mainWindow, 'page_profiles', profileManager);

}

function createAppFiles() {
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


    let options = {
        'title': 'Find location of mod-list.json file',
        'properties': ['openFile'],
        'filters': [{'name': 'Factorio Mod List', 'extensions': ['json']}]
    };

    helpers.log('Prompting user for Factorio modlist.json file.');
    let modPath = electron.dialog.showOpenDialog(options);
    if(modPath === undefined) {
        helpers.log('User cancelled the dialog search.');
        appManager.closeProgram(app, config, profileManager, true);
    }

    modPath = modPath[0];
    helpers.log(`User selected mod list at: ${modPath}`);
    if(modPath.indexOf('mod-list.json') === -1) {
        helpers.log('The selected file was not correct. Closing app.');
        appManager.closeProgram(app, config, profileManager, true);
    }


    data['modlist-path'] = modPath;
    data['mod-path'] = modPath.slice(0,modPath.indexOf('mod-list.json'));

    options = {
        'title': 'Find location of Factorio.exe file',
        'properties': ['openFile'],
        'filters': [{'name': 'Factorio Executable', 'extensions': ['exe']}]
    };

    helpers.log('Prompting user for Factorio.exe file.');
    let gamePath = electron.dialog.showOpenDialog(options);
    helpers.log(`User selected Factorio executable at: ${gamePath}`);

    if(gamePath === undefined) {
        helpers.log('User cancelled the dialog search.');
        appManager.closeProgram(app, config, profileManager, true);
    }
    gamePath = gamePath[0];
    if(gamePath.indexOf('factorio.exe') === -1) {
        helpers.log('The selected file was not correct. Closing app.');
        appManager.closeProgram(app, config, profileManager, true);
    }

    data['game-path'] = gamePath;

    try {
        modManager = new require('modManagement.js').Manager(data['modlist-path'], data['mod-path'], data['game-path']);

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

//---------------------------------------------------------