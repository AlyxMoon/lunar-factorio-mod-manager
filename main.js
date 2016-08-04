const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;
let config;

function log(data) {
    // TODO: More thorough logging through entire app
    // Disabled for first release, as logging is not consistent or helpful enough yet.
    //var file = require('fs');
    //file.appendFileSync('./lmm_log.txt', data + '\n');
}

function init() {
    log("Starting up the app");
    var file = require('fs');
    var path = "./lmm_config.json";

    var data;
    try {
        data = file.readFileSync(path, 'utf8');
        config = JSON.parse(data);
        createWindow();
    }
    catch(error) {
        if(error.code === 'ENOENT') {
            firstTimeRun();
        }
    }
}

function firstTimeRun() {
    log("Beginning first time initialization of the app");
    let file = require('fs');
    let path = "./lmm_config.json";

    let screenSize = electron.screen.getPrimaryDisplay().workAreaSize;
    let data = {
        'minWidth': screenSize.width / 2,
        'minHeight': screenSize.height / 1.25,
        'width': screenSize.width / 2,
        'height': screenSize.height,
        'x-loc': 0,
        'y-loc': 0,
        'mod-path': app.getPath('appData') + '/Factorio/mods',
        'modlist-path': '',
        'game-path': ''
    };
    log(data['mod-path']);
    electron.dialog.showOpenDialog({'title': 'Find mod-list directory', 'properties': ['openFile']}, function(modPath) {
        log('User selected mod list at:' + modPath[0]);
        data['modlist-path'] = modPath[0];

        electron.dialog.showOpenDialog({'title': 'Find Factorio.exe directory', 'properties': ['openFile']}, function(gamePath) {
            log('User selected Factorio.exe:' + gamePath);
            data['game-path'] = gamePath[0];

            try {
                file.writeFileSync(path, JSON.stringify(data));
                config = data;
            }
            catch(error) {
                log("Failed to write config on first time initialization, error: " + error.code);
                app.quit();
            }

            log("Successfully created config file, now creating profile");
            path = "./lmm_profiles.json";

            try {
                let data = [{
                    'name': 'Current Profile',
                    'enabled': true,
                    'mods': getFactorioModList()

                }];
                file.writeFileSync(path, JSON.stringify(data));
            }
            catch(error) {
                log("Failed to write profile file on first time initialization, error: " + error.code);
                app.quit();
            }
            log("Successfully created first profile");
            createWindow();
        });
    });

}

function getFactorioModList() {
    var file = require('fs');
    var path = config['modlist-path'];
    log("Checking for mod list at path: " + path);

    var data = file.readFileSync(path, 'utf8');
    return JSON.parse(data)['mods'];
}

function showCurrentModList() {
    let profile = [{
        'name': 'Current Profile',
        'mods': getFactorioModList(),
        'enabled': true
    }];
    mainWindow.webContents.send('data', profile);
}

function showAllProfiles() {
    let file = require('fs');
    let path = './lmm_profiles.json';

    let profiles = JSON.parse(file.readFileSync(path, 'utf8'));
    mainWindow.webContents.send('dataAllProfiles', profiles);
}

function showActiveProfile() {
    let file = require('fs');
    let path = './lmm_profiles.json';

    let profiles = JSON.parse(file.readFileSync(path, 'utf8'));
    for(var i = 0; i < profiles.length; i++) {
        if(profiles[i]['enabled']) {
            mainWindow.webContents.send('dataActiveProfile', profiles[i]);
            break;
        }
    }

}

function getInstalledMods() {
    let file = require('fs');
    let path = config['mod-path'];

    let data = file.readdirSync(path, 'utf8');
    for(var i = data.length - 1; i >= 0; i--) {
        if(data[i] === 'mod-list.json') {
            data.splice(i, 1);
        }
        else {
            data[i] = data[i].substr(0, data[i].lastIndexOf('_'));
        }

    }
    data.unshift('base');
    return data;
}

function showMods() {
    let data = getInstalledMods();
    mainWindow.webContents.send('dataMods', data);

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
        icon: 'img/favicon.ico'
    };
    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.setMenu(null);

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.webContents.on('did-finish-load', showActiveProfile);
    mainWindow.webContents.on('did-finish-load', showAllProfiles);
    mainWindow.webContents.on('did-finish-load', showMods);
    mainWindow.on('closed', function () {
        mainWindow = null;
    });

}
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

electron.ipcMain.on('modToggle', function(event, message) {
    let file = require('fs');

    // Save to Factorio mod list
    let path = app.getPath('appData') + '/Factorio/mods/mod-list.json';
    log("Checking for mod list at path (for rewrite): " + path);
    log("Mod to change: " + message['mod']);

    let data = file.readFileSync(path, 'utf8');
    data = JSON.parse(data);
    for(var i = 0; i < data['mods'].length; i++) {
        if(data['mods'][i]['name'] === message['mod']) {
            data['mods'][i]['enabled'] = message['enabled'];
            break;
        }
    }
    log('About to write file');
    log('Mod: ' + data['mods'][i]['name'] + ', Enabled: ' + data['mods'][i]['enabled']);
    file.writeFileSync(path, JSON.stringify(data));

    // Save to manager profile list
    path = './lmm_profiles.json';
    log("Saving profile changes");

    data = file.readFileSync(path, 'utf8');
    data = JSON.parse(data);
    for(var i = 0; i < data.length; i++) {
        if(data[i]['name'] === message['profile']) {
            for (var j = 0; j < data[i]['mods'].length; j++) {
                if (data[i]['mods'][j]['name'] === message['mod']) {
                    data[i]['mods'][j]['enabled'] = message['enabled'];
                    break;
                }
            }
            break;
        }
    }
    file.writeFileSync(path, JSON.stringify(data));
});

electron.ipcMain.on('newProfile', function(event,message) {
    log('Attempting to create new profile');
    let mods = getInstalledMods();
    let profile = {
        'name': 'New Profile',
        'enabled': false,
        'mods': []
    };
    for(var i = 0; i < mods.length; i++) {
        profile['mods'].push({
            'name': mods[i],
            'enabled': 'true'
        });
    }

    let file = require('fs');
    let data = JSON.parse(file.readFileSync('./lmm_profiles.json', 'utf8'));
    let n = 1;
    while(true) {
        let nameExists = false;
        for(var j = 0; j < data.length; j++) {
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
    file.writeFileSync('./lmm_profiles.json', JSON.stringify(data));
    showAllProfiles();
});

electron.ipcMain.on('activateProfile', function(event,name) {
    let file = require('fs');
    let data = JSON.parse(file.readFileSync('./lmm_profiles.json', 'utf8'));

    let modList = {'mods': []};
    for(var i = 0; i < data.length; i++) {
        if(data[i]['name'] === name) {
            data[i]['enabled'] = true;
            modList['mods'] = data[i]['mods'];
        }
        else data[i]['enabled'] = false;
    }
    file.writeFileSync('./lmm_profiles.json', JSON.stringify(data));
    file.writeFileSync(config['modlist-path'], JSON.stringify(modList));
    showAllProfiles();
    showActiveProfile();

});

electron.ipcMain.on('renameProfile', function(event, newName) {
    let file = require('fs');
    let data = JSON.parse(file.readFileSync('./lmm_profiles.json', 'utf8'));

    for(var i = 0; i < data.length; i++) {
        if(data[i]['enabled']) {
            data[i]['name'] = newName;
            break;
        }
    }
    file.writeFileSync('./lmm_profiles.json', JSON.stringify(data));
    showAllProfiles();
    showActiveProfile();
});

electron.ipcMain.on('deleteProfile', function(event) {
    let file = require('fs');
    let data = JSON.parse(file.readFileSync('./lmm_profiles.json', 'utf8'));

    let modList = {'mods': []};
    for(var i = 0; i < data.length; i++) {
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

    file.writeFileSync('./lmm_profiles.json', JSON.stringify(data));
    file.writeFileSync(config['modlist-path'], JSON.stringify(modList));

    showAllProfiles();
    showActiveProfile();

});

electron.ipcMain.on('startGame', function(event, message) {
    let spawn = require('child_process').spawn;
    // TODO: Don't make game directory hardcoded
    spawn('factorio.exe', [], {
        'stdio': 'ignore',
        'detached': true,
        'cwd': 'C:/Games/SteamLibrary/SteamApps/common/Factorio/bin/x64'
    }).unref();
    app.quit();

});