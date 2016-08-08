const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;
let config;

let fileCache = {
    'profiles': [],
    'active-profile': {},
    'mods': []
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


// Used as callback method
// No message is expected, will potentially provide ability to choose a profile name on creation
function createProfile(event) {
    log('Attempting to create a new profile');
    let mods = fileCache['mods'];
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

    let data = fileCache['profiles'];
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
    log(`Successfully created new profile: ${profile['name']}`);
    data.push(profile);
    showAllProfiles();
}

// Used as callback method
// "message" expected to be a string representing the name of an existing profile
function activateProfile(event, message) {
    log('Attempting to change active profile.');
    let data = fileCache['profiles'];

    for(let i = 0; i < data.length; i++) {
        if(data[i]['name'] === message) {
            data[i]['enabled'] = true;
            fileCache['active-profile'] = data[i];
        }
        else data[i]['enabled'] = false;
    }
    log(`Active profile changed, new active profile: ${fileCache['active-profile']['name']}`);
    showAllProfiles();
    showActiveProfile();
}

// Used as callback method
// "message" expected to be a string containing the new name for the active profile
function renameProfile(event, name) {
    log('Attempting to rename active profile.');
    fileCache['active-profile']['name'] = name;

    log(`Active profile name changed to: ${fileCache['active-profile']['name']}`);
    showAllProfiles();
    showActiveProfile();
}

// Used as callback method
// Currently only removes active profile, not any given profile
function deleteProfile(event) {
    log(`Attempting to delete active profile: '${fileCache['active-profile']['name']}'`);
    let data = fileCache['profiles'];

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
    fileCache['active-profile'] = data[0];
    log(`Successfully deleted profile. New active profile: ${fileCache['active-profile']['name']}`);
    showAllProfiles();
    showActiveProfile();
}

// Used as callback method
// Take one argument, a string representing which direction to move the active profile
function sortProfile(event, direction) {
    log(`Attempting to move profile '${fileCache['active-profile']['name']}' ${direction}`);

    let data = fileCache['profiles'];
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
            log('Profile has been moved up the list.');
        }
        else {
            log('No need to move profile up the list, already on top.');
        }
    }
    else if(direction === 'down') {
        if(index < data.length - 1) {
            let tempProfile = data[index + 1];
            data[index + 1] = data[index];
            data[index] = tempProfile;
            log('Profile has been moved down the list.');
        }
        else {
            log('No need to move profile down the list, already on bottom.');
        }
    }

    log(`Successfully moved profile '${fileCache['active-profile']['name']}' to index ${index}`);
    showAllProfiles();
}

// Used as callback method
// "message" is an object containing the profile mod applies to, mod name, and current mod enable status
// message['profile'], message['mod'], message['enabled']
function toggleMod(event, message) {
    log(`Attempting to change mod '${message['mod']}' from '${message['enabled']}' in profile: ${message['profile']}`);

    let profiles = fileCache['profiles'];
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
    log('Successfully changed mod status.');
}

// Used as callback method
// Does not expect any data to be passed in
function startGame(event) {
    log('Starting Factorio and shutting down app.');

    let spawn = require('child_process').spawn;
    let factorioPath = config['game-path'].slice(0, config['game-path'].indexOf('factorio.exe'));

    saveMods();
    spawn('factorio.exe', [], {
        'stdio': 'ignore',
        'detached': true,
        'cwd': factorioPath
    }).unref();
    closeProgram();
}

function log(data) {
    let file = require('fs');
    let logPath = `${__dirname}/lmm_log.txt`;
    let dateTime = new Date();
    dateTime = dateTime.toLocaleString();

    file.appendFileSync(logPath,`${dateTime} | ${data}\n`);
}

function init() {
    log('Beginning initialization of app.');
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

        log('Found config and profiles file, loaded successfully.');
        startProgram();
    }
    catch(error) {
        if(error.code === 'ENOENT') {
            log('Wasn not able to find config or profiles file.');
            createAppFiles();
        }
    }



}

function startProgram() {
    log('Starting the app now.');
    loadProfiles();
    loadInstalledMods();

    checkForNewMods();
    createWindow();
}

// Will save data and close app
// If called with inError, won't save data but will log info and close
function closeProgram(inError = false) {

    if(inError) {
        log('There was an error. Not saving app data, closing app.');
    }
    else {
        log('Beginning application shutdown.');
        saveProfiles();
        saveMods();
        log('Everything taken care of, closing app now.');
    }

    app.quit();
}

function createAppFiles() {
    log('Beginning to create config and profiles files.');
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
    log('Prompting user for Factorio modlist.json file.');
    electron.dialog.showOpenDialog(options, function(modPath) {
        log(`User selected mod list at: ${modPath[0]}`);

        data['modlist-path'] = modPath[0];
        data['mod-path'] = modPath[0].slice(0,modPath[0].indexOf('mod-list.json'));

        options = {
            'title': 'Find location of Factorio.exe file',
            'properties': ['openFile'],
            'filters': [{'name': 'Factorio Executable', 'extensions': ['exe']}]
        };
        log('Prompting user for Factorio.exe file.');
        electron.dialog.showOpenDialog(options, function(gamePath) {
            log(`User selected Factorio executable at: ${gamePath[0]}`);
            data['game-path'] = gamePath[0];

            try {
                file.writeFileSync(configPath, JSON.stringify(data));
                config = data;

                log('Successfully created config file, now creating profile');
                try {
                    let profile = [{
                        'name': 'Current Profile',
                        'enabled': true,
                        'mods': getFactorioModList()

                    }];
                    log('About to write new profiles file');
                    file.writeFileSync(profilesPath, JSON.stringify(profile));
                }
                catch(error) {
                    log('Failed to write profile file on first time initialization, error: ' + error.code);
                    closeProgram(true);
                }
                log('Successfully created first profile');
                config['config-path'] = configPath;
                config['profiles-path'] = profilesPath;
                startProgram();
            }
            catch(error) {
                log('Failed to write config on first time initialization, error: ' + error.code);
                closeProgram(true);
            }

        });
    });

}

function createWindow () {
    log('Creating the application window');

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

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.webContents.on('did-finish-load', showActiveProfile);
    mainWindow.webContents.on('did-finish-load', showAllProfiles);
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    log('Window created successfully, event registered');
}


function getFactorioModList() {
    log('Checking for mod list at path: ' + config['modlist-path']);
    let file = require('fs');
    let modlistPath = config['modlist-path'];


    let data = file.readFileSync(modlistPath, 'utf8');
    return JSON.parse(data)['mods'];
}

function showActiveProfile() {
    mainWindow.webContents.send('dataActiveProfile', fileCache['active-profile']);
}

function showAllProfiles() {
    mainWindow.webContents.send('dataAllProfiles', fileCache['profiles']);
}

function checkForNewMods() {
    log('Checking for newly installed mods.');

    let file = require('fs');
    let mods = fileCache['mods'];
    let profiles = fileCache['profiles'];
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
                log(`Found new mod: ${mods[j]} -- Adding to profile: ${profiles[i]['name']}`);
                profileMods.splice(index, 0, {'name': mods[j], 'enabled': 'false'});
            }
        }
        profileMods = sortMods(profileMods);
    }
    log('Finished looking for newly installed mods.');
    file.writeFileSync(config['profiles-path'], JSON.stringify(profiles));
    file.writeFileSync(config['modlist-path'], JSON.stringify(modList));
}

function sortMods(arr) {
    let prop = "name".split('.');
    let len = prop.length;

    arr.sort(function (a, b) {
        let i = 0;
        while( i < len ) { a = a[prop[i]].toLowerCase(); b = b[prop[i]].toLowerCase(); i++; }
            if (a < b) return -1;
            else if (a > b) return 1;
            else  return 0;
    });
    return arr;
}

function loadProfiles() {
    log('Beginning to load the profiles list');
    let file = require('fs');
    fileCache['profiles'] = JSON.parse(file.readFileSync(config['profiles-path'], 'utf8'));

    for(let i = fileCache['profiles'].length - 1; i >= 0; i--) {
        if(fileCache['profiles'][i]['enabled']) {
            fileCache['active-profile'] = fileCache['profiles'][i];
            break;
        }
    }
    log('Finished loading the profiles successfully.');
}

function loadInstalledMods() {
    log('Beginning to get list of currently installed mods.');
    let file = require('fs');
    let mods = file.readdirSync(config['mod-path'], 'utf8');

    for(let i = mods.length - 1; i >= 0; i--) {
        if(mods[i] === 'mod-list.json') mods.splice(i, 1);
        else mods[i] = mods[i].substr(0, mods[i].lastIndexOf('_'));
    }
    mods.push('base');
    mods = mods.sort(function(a,b) {
        a = a.toLowerCase();
        b = b.toLowerCase();
        if( a == b) return 0;
        if( a > b) return 1;
        return -1;
    });

    fileCache['mods'] = mods;
    log('Successfully got the list of currently installed mods.');
}

function saveProfiles() {
    log('Beginning to save the profiles.');
    let file = require('fs');
    file.writeFileSync(config['profiles-path'], JSON.stringify(fileCache['profiles']));
    log('Finished saving the profiles.');
}

function saveMods() {
    log('Beginning to save current mod configuration.');
    let file = require('fs');
    let modList = {
        'mods': fileCache['active-profile']['mods']
    };
    file.writeFileSync(config['modlist-path'], JSON.stringify(modList));
    log('Finished saving current mod configuration.');
}