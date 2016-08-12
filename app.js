const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;
let config;

const helpers = require('./inc/helpers.js');
const fileHandlers = require('./inc/fileHandling.js');

let appData = {
    'profiles': [],
    'active-profile': {},
    'mods': [],
    'modNames': [],
    'onlineMods': []
};

app.on('ready', init);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        closeProgram();
    }
});
app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
electron.ipcMain.on('newProfile', createProfile);
electron.ipcMain.on('activateProfile', activateProfile);
electron.ipcMain.on('renameProfile', renameProfile);
electron.ipcMain.on('deleteProfile', deleteProfile);
electron.ipcMain.on('sortProfile', sortProfile);
electron.ipcMain.on('toggleMod', toggleMod);
electron.ipcMain.on('startGame', startGame);
electron.ipcMain.on('changePage', changePage);
electron.ipcMain.on('requestInstalledModInfo', showInstalledModInfo);
electron.ipcMain.on('requestOnlineModInfo', showOnlineModInfo);


// Used as callback method
// No message is expected, will potentially provide ability to choose a profile name on creation
function createProfile(event) {
    helpers.log('Attempting to create a new profile');
    let mods = appData['modNames'];
    let profile = {
        'name': 'New Profile',
        'enabled': false,
        'mods': []
    };
    for(let i = 0; i < mods.length; i++) {
        profile['mods'].push({
            'name': mods[i],
            'enabled': 'true'
        });
    }

    let data = appData['profiles'];
    let n = 1;
    while(true) {
        let nameExists = false;
        for(let j = 0; j < data.length; j++) {
            if(data[j]['name'] === profile['name'] + ' ' + n) {
                nameExists = true;
                n++;
                break;
            }
        }
        if(!nameExists) {
            profile['name'] = profile['name'] + ' ' + n;
            break;
        }
    }
    helpers.log(`Successfully created new profile: ${profile['name']}`);
    data.push(profile);
    showAllProfiles();
}

// Used as callback method
// "message" expected to be a string representing the name of an existing profile
function activateProfile(event, message) {
    helpers.log('Attempting to change active profile.');
    let data = appData['profiles'];

    for(let i = 0; i < data.length; i++) {
        if(data[i]['name'] === message) {
            data[i]['enabled'] = true;
            appData['active-profile'] = data[i];
        }
        else data[i]['enabled'] = false;
    }
    helpers.log(`Active profile changed, new active profile: ${appData['active-profile']['name']}`);
    showAllProfiles();
    showActiveProfile();
}

// Used as callback method
// "message" expected to be a string containing the new name for the active profile
function renameProfile(event, name) {
    helpers.log('Attempting to rename active profile.');
    appData['active-profile']['name'] = name;

    helpers.log(`Active profile name changed to: ${appData['active-profile']['name']}`);
    showAllProfiles();
    showActiveProfile();
}

// Used as callback method
// Currently only removes active profile, not any given profile
function deleteProfile(event) {
    helpers.log(`Attempting to delete active profile: '${appData['active-profile']['name']}'`);
    let data = appData['profiles'];

    for(let i = 0; i < data.length; i++) {
        if(data[i]['enabled']) {
            data.splice(i, 1);
            break;
        }
    }

    if(data.length === 0) {
        data = [{
            'name': 'Current Profile',
            'enabled': true,
            'mods': getFactorioModList()

        }];
    }
    data[0]['enabled'] = true;
    appData['active-profile'] = data[0];
    helpers.log(`Successfully deleted profile. New active profile: ${appData['active-profile']['name']}`);
    showAllProfiles();
    showActiveProfile();
}

// Used as callback method
// Take one argument, a string representing which direction to move the active profile
function sortProfile(event, direction) {
    helpers.log(`Attempting to move profile '${appData['active-profile']['name']}' ${direction}`);

    let data = appData['profiles'];
    let index = 0;
    for(let i = 0; i < data.length; i++) {
        if(data[i]['enabled']) {
            index = i;
            break;
        }
    }

    if(direction === 'up') {
        if(index > 0) {
            let tempProfile = data[index - 1];
            data[index - 1] = data[index];
            data[index] = tempProfile;
            helpers.log('Profile has been moved up the list.');
        }
        else {
            helpers.log('No need to move profile up the list, already on top.');
        }
    }
    else if(direction === 'down') {
        if(index < data.length - 1) {
            let tempProfile = data[index + 1];
            data[index + 1] = data[index];
            data[index] = tempProfile;
            helpers.log('Profile has been moved down the list.');
        }
        else {
            helpers.log('No need to move profile down the list, already on bottom.');
        }
    }

    helpers.log(`Successfully moved profile '${appData['active-profile']['name']}' to index ${index}`);
    showAllProfiles();
}

// Used as callback method
// "message" is an object containing the profile mod applies to, mod name, and current mod enable status
// message['profile'], message['mod'], message['enabled']
function toggleMod(event, message) {
    helpers.log(`Attempting to change mod '${message['mod']}' from '${message['enabled']}' in profile: ${message['profile']}`);

    let profiles = appData['profiles'];
    let profile = {};
    for(let i = profiles.length - 1; i >= 0; i--) {
        if(profiles[i]['name'] === message['profile']) {
            profile = profiles[i];
            break;
        }
    }
    for(let i = profile['mods'].length - 1; i >= 0; i--) {
        if (profile['mods'][i]['name'] === message['mod']) {
            profile['mods'][i]['enabled'] = message['enabled'];
            break;
        }
    }
    helpers.log('Successfully changed mod status.');
}

// Used as callback method
// Does not expect any data to be passed in
function startGame(event) {
    helpers.log('Starting Factorio and shutting down app.');

    let spawn = require('child_process').spawn;
    let factorioPath = config['game-path'].slice(0, config['game-path'].indexOf('factorio.exe'));

    fileHandlers.setProfileAsModlist(config['modlist-path'], appData['active-profile']);
    spawn('factorio.exe', [], {
        'stdio': 'ignore',
        'detached': true,
        'cwd': factorioPath
    }).unref();
    closeProgram();
}

// Used as callback method
// Expects one argument, a string containing name of new page to switch to
function changePage(event, newPage) {
    helpers.log(`Attempting to change the page to ${newPage}`);

    if(newPage === 'page_profiles') {
        mainWindow.loadURL(`file://${__dirname}/${newPage}.html`);
        mainWindow.webContents.once('did-finish-load', showActiveProfile);
        mainWindow.webContents.once('did-finish-load', showAllProfiles);
    }
    else if(newPage === 'page_localMods') {
        mainWindow.loadURL(`file://${__dirname}/${newPage}.html`);
        mainWindow.webContents.once('did-finish-load', showInstalledMods);
    }
    else if(newPage === 'page_onlineMods') {
        mainWindow.loadURL(`file://${__dirname}/${newPage}.html`);
        mainWindow.webContents.once('did-finish-load', showOnlineMods);
    }
    else {
        helpers.log('Turns out that page isn\'t set up. Let me know and I\'ll change that.');
    }
}

// Used as callback method
// Expects one argument, a string containing the name of the mod to get info on
function showInstalledModInfo(event, modName) {

    let mods = appData['mods'];
    for(let i = mods.length - 1; i >= 0; i--) {
        if(mods[i]['name'] === modName) {
            mainWindow.webContents.send('dataInstalledModInfo', mods[i]);
            break;
        }
    }

}

// Used as callback method
// Expects one argument, a string containing the name of the mod to get info on
function showOnlineModInfo(event, modName) {

    let mods = appData['onlineMods'];
    for(let i = mods.length - 1; i >= 0; i--) {
        if(mods[i]['name'] === modName) {
            mainWindow.webContents.send('dataOnlineModInfo', mods[i]);
            break;
        }
    }

}


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

    let tempProfiles = fileHandlers.loadProfiles(config['profiles-path']);
    appData['profiles'] = tempProfiles['profiles'];
    appData['active-profile'] = tempProfiles['active-profile'];

    loadInstalledMods();

    createWindow();
}

// Will save data and close app
// If called with inError, won't save data but will log info and close
function closeProgram(inError = false) {

    if(inError) {
        helpers.log('There was an error. Not saving app data, closing app.');
        app.exit(-1);
    }
    else {
        helpers.log('Beginning application shutdown.');
        fileHandlers.saveProfiles(config['profiles-path'], appData['profiles']);
        fileHandlers.setProfileAsModlist(config['modlist-path'], appData['active-profile']);
        helpers.log('Everything taken care of, closing app now.');
        app.quit();
    }
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
        closeProgram(true);
    }

    modPath = modPath[0];
    helpers.log(`User selected mod list at: ${modPath}`);
    if(modPath.indexOf('mod-list.json') === -1) {
        helpers.log('The selected file was not correct. Closing app.');
        closeProgram(true);
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
        closeProgram(true);
    }
    gamePath = gamePath[0];
    if(gamePath.indexOf('factorio.exe') === -1) {
        helpers.log('The selected file was not correct. Closing app.');
        closeProgram(true);
    }

    data['game-path'] = gamePath;

    try {
        file.writeFileSync(configPath, JSON.stringify(data));
        config = data;

        helpers.log('Successfully created config file, now creating profile');
        try {
            let profile = [{
                'name': 'Current Profile',
                'enabled': true,
                'mods': getFactorioModList()

            }];
            helpers.log('About to write new profiles file');
            file.writeFileSync(profilesPath, JSON.stringify(profile));
        }
        catch(error) {
            helpers.log('Failed to write profile file on first time initialization, error: ' + error.code);
            closeProgram(true);
        }
        helpers.log('Successfully created first profile');
        config['config-path'] = configPath;
        config['profiles-path'] = profilesPath;
        startProgram();
    }
    catch(error) {
        helpers.log('Failed to write config on first time initialization, error: ' + error.code);
        closeProgram(true);
    }
}

function createWindow () {
    helpers.log('Creating the application window');

    windowOptions = {
        minWidth: config['minWidth'],
        minHeight: config['minHeight'],
        width: config['width'],
        height: config['height'],
        x: config['x-loc'],
        y: config['y-loc'],
        resizable: true,
        title: 'Lunar\'s [Factorio] Mod Manager',
        icon: __dirname + '/img/favicon.ico'
    };
    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.setMenu(null);

    mainWindow.loadURL(`file://${__dirname}/page_profiles.html`);
    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.webContents.send('ping', appData['mods']);
    });

    mainWindow.webContents.once('did-finish-load', showActiveProfile);
    mainWindow.webContents.once('did-finish-load', showAllProfiles);
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    helpers.log('Window created successfully, event registered');
}

function getFactorioModList() {
    helpers.log('Checking for mod list at path: ' + config['modlist-path']);
    let file = require('fs');
    let modlistPath = config['modlist-path'];


    let data = file.readFileSync(modlistPath, 'utf8');
    return JSON.parse(data)['mods'];
}

function showActiveProfile() {
    mainWindow.webContents.send('dataActiveProfile', appData['active-profile']);
}

function showAllProfiles() {
    mainWindow.webContents.send('dataAllProfiles', appData['profiles']);
}

function showInstalledMods() {
    mainWindow.webContents.send('dataInstalledMods', appData['modNames']);
}
function showOnlineMods() {
    if(appData['onlineMods'].length === 0) {
        helpers.log('Getting online mods.');
        loadOnlineMods();
    }
    else {
        helpers.log('Already have online mods list, showing.');
        mainWindow.webContents.send('dataOnlineMods', appData['onlineMods']);
    }

}

function checkForNewMods() {
    helpers.log('Checking for newly installed mods.');

    let file = require('fs');
    let mods = appData['modNames'];
    let profiles = appData['profiles'];
    let modList = {'mods': []};
    for(let i = 0; i < profiles.length; i++) {
        if(profiles[i]['enabled']) {
            modList['mods'] = profiles[i]['mods'];
        }
        let profileMods = profiles[i]['mods'];
        for(let j = 0; j < mods.length; j++) {

            let index = -1;
            for(let k = 0; k < profileMods.length; k++) {
                if(profileMods[k]['name'] === mods[j]) {
                    index = k;
                    break;
                }
            }

            if(index === -1) {
                helpers.log(`Found new mod: ${mods[j]} -- Adding to profile: ${profiles[i]['name']}`);
                profileMods.splice(index, 0, {'name': mods[j], 'enabled': 'false'});
            }
        }
        profileMods = helpers.sortArrayByProp(profileMods, 'name');
    }
    helpers.log('Finished looking for newly installed mods.');
    file.writeFileSync(config['profiles-path'], JSON.stringify(profiles));
    file.writeFileSync(config['modlist-path'], JSON.stringify(modList));
}

function loadInstalledMods() {
    helpers.log('Beginning to load installed mods.');
    //mainWindow.webContents.openDevTools();
    let file = require('fs');
    let JSZip = require('jszip');

    let modZipNames = file.readdirSync(config['mod-path'], 'utf8');
    modZipNames.splice(modZipNames.indexOf('mod-list.json'), 1);

    let mods = [];

    // Add base mod
    let gamePath = config['game-path'];
    let baseInfo = `${gamePath.substr(0, gamePath.lastIndexOf('Factorio\\bin'))}Factorio/data/base/info.json`;
    mods.push(JSON.parse(file.readFileSync(baseInfo, 'utf8')));

    let counter = modZipNames.length;
    for(let i = 0; i < modZipNames.length; i++) {
        // Exclude the not-zip-file that will be sitting in the directory
        if(modZipNames[i] !== 'mod-list.json') {

            // Open the zip file as a buffer
            file.readFile(`${config['mod-path']}${modZipNames[i]}`, function(error, rawZipBuffer) {
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
                        // Just send data to the console for now
                        mods = helpers.sortArrayByProp(mods, 'name');
                        appData['mods'] = mods;
                        appData['modNames'] = mods.map(function(mod) {
                           return mod['name']
                        });

                        checkForNewMods();
                    }
                });
            });
        }
    }
}

// This will be the best method in the world!
function loadOnlineMods() {
    let request = require('request');

    let apiURL = 'https://mods.factorio.com/api/mods';
    let options = '?page_size=20';

    getOnlineModData(`${apiURL}${options}`, function() {
        mainWindow.webContents.send('dataOnlineMods', appData['onlineMods']);
    });

    function getOnlineModData(url, callback) {

        request(url ,function(error, response, data) {
            if(!error && response.statusCode == 200) {
                data = JSON.parse(data);

                for(let i = 0; i < data['results'].length; i++) {
                    appData['onlineMods'].push(data['results'][i]);
                }

                if(data['pagination']['links']['next']) {
                    getOnlineModData(data['pagination']['links']['next'], callback);
                }
                else {
                    callback();
                }
            }
            else {
                throw error;
            }

        });
    }
}