const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;
let config;

let fileCache = {
    'profiles': [],
    'active-profile': {},
    'mods': [],
    'modNames': []
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
electron.ipcMain.on('requestModInfo', requestModInfo);


// Used as callback method
// No message is expected, will potentially provide ability to choose a profile name on creation
function createProfile(event) {
    log('Attempting to create a new profile');
    let mods = fileCache['modNames'];
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

// Used as callback method
// Expects one argument, a string containing name of new page to switch to
function changePage(event, newPage) {
    log(`Attempting to change the page to ${newPage}`);

    if(newPage === 'page_profiles') {
        mainWindow.loadURL(`file://${__dirname}/${newPage}.html`);
        mainWindow.webContents.on('did-finish-load', showActiveProfile);
        mainWindow.webContents.on('did-finish-load', showAllProfiles);
    }
    else if(newPage === 'page_localMods') {
        mainWindow.loadURL(`file://${__dirname}/${newPage}.html`);
        mainWindow.webContents.on('did-finish-load', showInstalledMods);
    }
    else if(newPage === 'page_onlineMods') {
        mainWindow.loadURL(`file://${__dirname}/${newPage}.html`);
    }
    else {
        log('Turns out that page isn\'t set up. Let me know and I\'ll change that.');
    }
}

// Used as callback method
// Expects one argument, a string containing the name of the mod to get info on
function requestModInfo(event, modName) {

    let mods = fileCache['mods'];
    for(let i = fileCache['mods'].length - 1; i >= 0; i--) {
        if(mods[i]['name'] === modName) {
            mainWindow.webContents.send('dataModInfo', mods[i]);
            break;
        }
    }

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
            log('Was not able to find config or profiles file.');
            createAppFiles();
        }
    }
}

function startProgram() {
    log('Starting the app now.');
    loadProfiles();
    loadInstalledMods();

    createWindow();
}

// Will save data and close app
// If called with inError, won't save data but will log info and close
function closeProgram(inError = false) {

    if(inError) {
        log('There was an error. Not saving app data, closing app.');
        app.exit(-1);
    }
    else {
        log('Beginning application shutdown.');
        saveProfiles();
        saveMods();
        log('Everything taken care of, closing app now.');
        app.quit();
    }
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
    let modPath = electron.dialog.showOpenDialog(options);
    if(modPath === undefined) {
        log('User cancelled the dialog search.');
        closeProgram(true);
    }

    modPath = modPath[0];
    log(`User selected mod list at: ${modPath}`);
    if(modPath.indexOf('mod-list.json') === -1) {
        log('The selected file was not correct. Closing app.');
        closeProgram(true);
    }


    data['modlist-path'] = modPath;
    data['mod-path'] = modPath.slice(0,modPath.indexOf('mod-list.json'));

    options = {
        'title': 'Find location of Factorio.exe file',
        'properties': ['openFile'],
        'filters': [{'name': 'Factorio Executable', 'extensions': ['exe']}]
    };

    log('Prompting user for Factorio.exe file.');
    let gamePath = electron.dialog.showOpenDialog(options);
    log(`User selected Factorio executable at: ${gamePath}`);

    if(gamePath === undefined) {
        log('User cancelled the dialog search.');
        closeProgram(true);
    }
    gamePath = gamePath[0];
    if(gamePath.indexOf('factorio.exe') === -1) {
        log('The selected file was not correct. Closing app.');
        closeProgram(true);
    }

    data['game-path'] = gamePath;

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

    mainWindow.loadURL(`file://${__dirname}/page_profiles.html`);
    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.webContents.send('ping', fileCache['mods']);
    });

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

function showInstalledMods() {
    mainWindow.webContents.send('dataInstalledMods', fileCache['modNames']);
}

function checkForNewMods() {
    log('Checking for newly installed mods.');

    let file = require('fs');
    let mods = fileCache['modNames'];
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


function saveProfiles() {
    log('Beginning to save the profiles.');
    let file = require('fs');
    file.writeFileSync(config['profiles-path'], JSON.stringify(fileCache['profiles']));
    log('Finished saving the profiles.');
}

function loadInstalledMods() {
    log('starting the mod hunt');
    //mainWindow.webContents.openDevTools();
    let file = require('fs');
    let JSZip = require('jszip');

    let modZipNames = file.readdirSync(config['mod-path'], 'utf8');
    let mods = [];

    // Add base mod
    let gamePath = config['game-path'];
    let baseInfo = `${gamePath.substr(0, gamePath.lastIndexOf('Factorio\\bin'))}Factorio/data/base/info.json`;
    mods.push(JSON.parse(file.readFileSync(baseInfo, 'utf8')));

    log('starting to parse the zips');

    let counter = modZipNames.length - 1;
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
                        mods = sortMods(mods);
                        fileCache['mods'] = mods;
                        fileCache['modNames'] = mods.map(function(mod) {
                           return mod['name']
                        });

                        checkForNewMods();
                    }
                });
            });
        }
    }
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