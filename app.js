const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;
let config;

app.on('ready', init);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
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
    let file = require('fs');
    let profilesPath = config['profiles-path'];


    log('Attempting to create new profile');
    let mods = getInstalledMods();
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


    let data = JSON.parse(file.readFileSync(profilesPath, 'utf8'));
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
    data.push(profile);
    file.writeFileSync(profilesPath, JSON.stringify(data));
    showAllProfiles();
}

// Used as callback method
// "message" expected to be a string representing the name of an existing profile
function activateProfile(event, message) {
    let file = require('fs');
    let profilesPath = config['profiles-path'];

    let data = JSON.parse(file.readFileSync(profilesPath, 'utf8'));

    let modList = {'mods': []};
    for(let i = 0; i < data.length; i++) {
        if(data[i]['name'] === message) {
            data[i]['enabled'] = true;
            modList['mods'] = data[i]['mods'];
        }
        else data[i]['enabled'] = false;
    }
    file.writeFileSync(profilesPath, JSON.stringify(data));
    file.writeFileSync(config['modlist-path'], JSON.stringify(modList));
    showAllProfiles();
    showActiveProfile();
}

// Used as callback method
// "message" expected to be a string containing the new name for the active profile
function renameProfile(event, message) {
    let file = require('fs');
    let profilesPath = config['profiles-path'];

    let data = JSON.parse(file.readFileSync(profilesPath, 'utf8'));

    for(let i = 0; i < data.length; i++) {
        if(data[i]['enabled']) {
            data[i]['name'] = message;
            break;
        }
    }
    file.writeFileSync(profilesPath, JSON.stringify(data));
    showAllProfiles();
    showActiveProfile();
}

// Used as callback method
// Currently only removes active profile, not any given profile
function deleteProfile(event) {
    let file = require('fs');
    let profilesPath = config['profiles-path'];

    let data = JSON.parse(file.readFileSync(profilesPath, 'utf8'));

    let modList = {'mods': []};
    for(let i = 0; i < data.length; i++) {
        if(data[i]['enabled']) {
            log(data[i]['name']);
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
    else {
        data[0]['enabled'] = true;
    }
    modList['mods'] = data[0]['mods'];

    file.writeFileSync(profilesPath, JSON.stringify(data));
    file.writeFileSync(config['modlist-path'], JSON.stringify(modList));

    showAllProfiles();
    showActiveProfile();
}

// Used as callback method
// Take one argument, a string representing which direction to move the active profile
function sortProfile(event, direction) {
    let file = require('fs');
    let profilesPath = config['profiles-path'];

    let data = JSON.parse(file.readFileSync(profilesPath, 'utf8'));
    let index = 0;
    for(let i = 0; i < data.length; i++) {
        if(data[i]['enabled']) {
            index = i;
            break;
        }
    }

    if(direction === 'up' && index > 0) {
        let tempProfile = data[index - 1];
        data[index - 1] = data[index];
        data[index] = tempProfile;
    }
    else if(direction === 'down' && index < data.length - 1) {
        let tempProfile = data[index + 1];
        data[index + 1] = data[index];
        data[index] = tempProfile;
    }
    file.writeFileSync(profilesPath, JSON.stringify(data));
    showAllProfiles();
}

// Used as callback method
// "message" is an object containing the profile mod applies to, mod name, and current mod enable status
// message['profile'], message['mod'], message['enabled']
function toggleMod(event, message) {
    let file = require('fs');
    let modlistPath = config['modlist-path'];
    let profilesPath = config['profiles-path'];

    // Save to Factorio mod list
    log('Checking for mod list at path (for rewrite): ' + modlistPath);
    log('Mod to change: ' + message['mod']);

    let data = file.readFileSync(modlistPath, 'utf8');
    data = JSON.parse(data);
    for(let i = 0; i < data['mods'].length; i++) {
        if(data['mods'][i]['name'] === message['mod']) {
            data['mods'][i]['enabled'] = message['enabled'];
            break;
        }
    }
    log('About to write file');
    file.writeFileSync(modlistPath, JSON.stringify(data));

    // Save to manager profile list
    log('Saving profile changes');

    data = file.readFileSync(profilesPath, 'utf8');
    data = JSON.parse(data);
    for(let i = 0; i < data.length; i++) {
        if(data[i]['name'] === message['profile']) {
            for (let j = 0; j < data[i]['mods'].length; j++) {
                if (data[i]['mods'][j]['name'] === message['mod']) {
                    data[i]['mods'][j]['enabled'] = message['enabled'];
                    break;
                }
            }
            break;
        }
    }
    file.writeFileSync(profilesPath, JSON.stringify(data));
}

// Used as callback method
// Does not expect any data to be passed in
function startGame(event) {
    let spawn = require('child_process').spawn;
    let factorioPath = config['game-path'].slice(0, config['game-path'].indexOf('factorio.exe'));
    spawn('factorio.exe', [], {
        'stdio': 'ignore',
        'detached': true,
        'cwd': factorioPath
    }).unref();
    app.quit();
}


function log(data) {
    let file = require('fs');
    let logPath = `${__dirname}/lmm_log.txt`;
    let dateTime = new Date();
    dateTime = dateTime.toLocaleString();

    file.appendFileSync(logPath,`${dateTime} | ${data}\n`);
}

function init() {
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
        checkForNewMods();
        createWindow();
    }
    catch(error) {
        if(error.code === 'ENOENT') {
            createConfigFile();
        }
    }



}

function createConfigFile() {
    log('Beginning first time initialization of the app');
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
    electron.dialog.showOpenDialog(options, function(modPath) {
        log('User selected mod list at:' + modPath[0]);
        data['modlist-path'] = modPath[0];
        data['mod-path'] = modPath[0].slice(0,modPath[0].indexOf('mod-list.json'));

        options = {
            'title': 'Find location of Factorio.exe file',
            'properties': ['openFile'],
            'filters': [{'name': 'Factorio Executable', 'extensions': ['exe']}]
        };
        electron.dialog.showOpenDialog(options, function(gamePath) {
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
                    app.quit();
                }
                log('Successfully created first profile');
                config['config-path'] = configPath;
                config['profiles-path'] = profilesPath;
                checkForNewMods();
                createWindow();
            }
            catch(error) {
                log('Failed to write config on first time initialization, error: ' + error.code);
                app.quit();
            }

        });
    });

}

function createWindow () {

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
    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on('did-finish-load', showActiveProfile);
    mainWindow.webContents.on('did-finish-load', showAllProfiles);
    //mainWindow.webContents.on('did-finish-load', showMods);
    mainWindow.on('closed', function () {
        mainWindow = null;
    });

}


function getFactorioModList() {
    log('Checking for mod list at path: ' + config['modlist-path']);
    let file = require('fs');
    let modlistPath = config['modlist-path'];


    let data = file.readFileSync(modlistPath, 'utf8');
    return JSON.parse(data)['mods'];
}

function getInstalledMods() {
    log('Beginning to get list of currently installed mods.');
    let file = require('fs');
    let modsPath = config['mod-path'];

    let data = file.readdirSync(modsPath, 'utf8');
    for(let i = data.length - 1; i >= 0; i--) {
        if(data[i] === 'mod-list.json') {
            data.splice(i, 1);
        }
        else {
            data[i] = data[i].substr(0, data[i].lastIndexOf('_'));
        }

    }
    data.unshift('base');
    log('Successfully got the list of currently installed mods.');
    return data;
}

function showCurrentModList() {
    let profile = [{
        'name': 'Current Profile',
        'mods': getFactorioModList(),
        'enabled': true
    }];
    mainWindow.webContents.send('data', profile);
}

function showActiveProfile() {
    let file = require('fs');
    let profilesPath = config['profiles-path'];

    let profiles = JSON.parse(file.readFileSync(profilesPath, 'utf8'));
    for(let i = 0; i < profiles.length; i++) {
        if(profiles[i]['enabled']) {
            mainWindow.webContents.send('dataActiveProfile', profiles[i]);
            break;
        }
    }

}

function showAllProfiles() {
    let file = require('fs');
    let profilesPath = config['profiles-path'];

    let profiles = JSON.parse(file.readFileSync(profilesPath, 'utf8'));
    mainWindow.webContents.send('dataAllProfiles', profiles);
}

function checkForNewMods() {
    log('Checking for newly installed mods.');

    let file = require('fs');
    let mods = getInstalledMods();
    let profiles = JSON.parse(file.readFileSync(config['profiles-path'], 'utf8'));
    let modList = {'mods': []};
    for(let i = 0; i < profiles.length; i++) {
        log(`Updating profile: ${profiles[i]['name']}`);
        if(profiles[i]['enabled']) {
            modList['mods'] = profiles[i]['mods'];
            log(`Active profile: ${profiles[i]['name']}`);
        }
        let profileMods = profiles[i]['mods'];
        for(let j = 0; j < mods.length; j++) {
            log(`Checking if mod "${mods[j]}" is in profile.`);

            let index = -1;
            for(let k = 0; k < profileMods.length; k++) {
                if(profileMods[k]['name'] === mods[j]) {
                    index = k;
                    break;
                }
            }

            if(index === -1) {
                log(`Found new mod: ${mods[j]}, Adding to profile: ${profiles[i]['name']}`);
                profileMods.splice(index, 0, {'name': mods[j], 'enabled': 'false'});
            }
        }
        profileMods = sortMods(profileMods);
    }
    log('Finished looking for newly installed mods.');
    file.writeFileSync(config['profiles-path'], JSON.stringify(profiles));
    file.writeFileSync(config['modlist-path'], JSON.stringify(modList));
}

function showMods() {
    let data = getInstalledMods();
    mainWindow.webContents.send('dataMods', data);

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