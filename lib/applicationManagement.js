const helpers = require('./helpers.js');
module.exports = {
    Manager: AppManager
};
//---------------------------------------------------------
// Primary class declaration

function AppManager(configPath) {
    this.configPath = configPath;
    this.config;

    this.appVersion = this.loadAppMetaInfo().version;
    this.latestVersion;
    this.latestVersionLink;
    this.latestVersionDownloadURL;

    this.fetchLatestAppInfo();
}

//---------------------------------------------------------
// Sending data to the client
AppManager.prototype.sendAppVersion = function(window) {
    window.webContents.send('dataAppVersion', this.appVersion, this.latestVersion, this.latestVersionLink);
};
AppManager.prototype.sendAppConfig = function(window) {
    window.webContents.send('dataAppConfig', this.config);
};

//---------------------------------------------------------
// File-Management

AppManager.prototype.saveConfig = function() {
    let file = require('fs');
    file.writeFileSync(this.configPath, JSON.stringify(this.config, null, 4));
    helpers.log('Saved application configuration.');
};

AppManager.prototype.loadConfig = function(electronDialog, screenWidth, screenHeight) {
    let file = require('fs');
    let data;

    //------------------------------
    // Attempt to load config file
    try {
        data = file.readFileSync(this.configPath, 'utf8');
    }
    catch(error) {
        if(error.code === 'ENOENT') {
            helpers.log('Was not able to find config file. Creating.');
            return this.buildConfigFile(electronDialog, screenWidth, screenHeight);
        }
        else { // TODO: Handle unexpected errors more appropriately?
            helpers.log(`Unhandled error attempting to load config file. Error: ${error.message}`);
            return null;
        }
    }

    //------------------------------
    // Check data for integrity
    try {
        data = JSON.parse(data);
    }
    catch(error) {
        helpers.log(`Error parsing config file, rebuilding. Error: ${error.message}`);
        return this.buildConfigFile(electronDialog, screenWidth, screenHeight);
    }

    // if(!data.hasOwnProperty('minWidth') || typeof data.minWidth !== 'number') {
    //     // The value of this property isn't critical, nothing excessive needed
    //     helpers.log('minWidth not found parsing config, setting a default value and continuing.');
    //     data.minWidth = 0;
    // }
    // if(!data.hasOwnProperty('minHeight') || typeof data.minHeight !== 'number') {
    //     // The value of this property isn't critical, nothing excessive needed
    //     helpers.log('minHeight not found parsing config, setting a default value and continuing.');
    //     data.minHeight = 0;
    // }
    if(!data.hasOwnProperty('width') || typeof data.width !== 'number') {
        // The value of this property isn't critical, nothing excessive needed
        helpers.log('width not found parsing config, setting a default value and continuing.');
        data.width = 0;
    }
    if(!data.hasOwnProperty('height') || typeof data.height !== 'number') {
        // The value of this property isn't critical, nothing excessive needed
        helpers.log('height not found parsing config, setting a default value and continuing.');
        data.height = 0;
    }
    if(data.width < (screenWidth / 2)) data.width = screenWidth / 2;
    if(data.height < (screenHeight / 1.25)) data.height = screenHeight / 1.25;

    if(!data.hasOwnProperty('x_loc') || typeof data.x_loc !== 'number') {
        // The value of this property isn't critical, nothing excessive needed
        helpers.log('x_loc not found parsing config, setting a default value and continuing.');
        data.x_loc = 0;
    }
    if(!data.hasOwnProperty('y_loc') || typeof data.y_loc !== 'number') {
        // The value of this property isn't critical, nothing excessive needed
        helpers.log('y_loc not found parsing config, setting a default value and continuing.');
        data.y_loc = 0;
    }

    if(!data.hasOwnProperty('mod_directory_path') || typeof data.mod_directory_path !== 'string') {
        // Give some backward compatibility. Remove in about a month, ~ October 1st
        if(data.hasOwnProperty('mod-path') || typeof data['mod-path'] === 'string') {
            data.mod_directory_path = data['mod-path'].slice();
            delete data['mod-path'];
        }
        else {
            // Critical, can't fudge this one if not there
            helpers.log('mod_directory_path not in config file, rebuilding config file.');
            return this.buildConfigFile(electronDialog, screenWidth, screenHeight);
        }
    }
    if(!data.hasOwnProperty('modlist_path') || typeof data.modlist_path !== 'string') {
        // Give some backward compatibility. Remove in about a month, ~ October 1st
        if(data.hasOwnProperty('modlist-path') || typeof data['modlist-path'] === 'string') {
            data.modlist_path = data['modlist-path'].slice();
            delete data['modlist-path'];
        }
        else {
            // Critical, can't fudge this one if not there
            helpers.log('modlist_path not in config file, rebuilding config file.');
            return this.buildConfigFile(electronDialog, screenWidth, screenHeight);
        }
    }
    if(!data.hasOwnProperty('game_path') || typeof data.game_path !== 'string') {
        // Give some backward compatibility. Remove in about a month, ~ October 1st
        if(data.hasOwnProperty('game-path') || typeof data['game-path'] === 'string') {
            data.game_path = data['game-path'].slice();
            delete data['game-path'];
        }
        else {
            // Critical, can't fudge this one if not there
            helpers.log('game_path not in config file, rebuilding config file.');
            return this.buildConfigFile(electronDialog, screenWidth, screenHeight);
        }
    }
    if(!data.hasOwnProperty('player_data_path') || typeof data.player_data_path !== 'string') {
        // Critical, can't fudge this one if not there
        helpers.log('player_data_path not in config file, rebuilding config file.');
        return this.buildConfigFile(electronDialog, screenWidth, screenHeight);
    }

    this.config = data;
    return data;
};

AppManager.prototype.buildConfigFile = function(electron, screenWidth, screenHeight) {
    let file = require('fs');
    let modListPath, modDirectoryPath, gamePath, playerConfigPath;

    //------------------------------
    // Check data for integrity
    if(screenWidth === undefined || typeof screenWidth !== 'number' || screenWidth <= 0) {
        // Guess for a lower resolution
        helpers.log('screenWidth not provided to buildConfigFile, setting to a default and continuing to build.');
        screenWidth = 1280;
    }
    if(screenHeight === undefined || typeof screenHeight !== 'number' || screenHeight <= 0) {
        // Guess for a lower resolution
        helpers.log('screenHeight not provided to buildConfigFile, setting to a default and continuing to build.');
        screenHeight = 720;
    }

    modListPath = this.promptForModlist(electron);
    if(modListPath === undefined) {
        helpers.log('User cancelled the dialog search.');
        return null;
    }
    else if(modListPath.indexOf('mod-list.json') === -1) {
        helpers.log(`The selected file was not correct. Closing app. File: ${modListPath}`);
        return null;
    }
    modDirectoryPath = modListPath.slice(0, modListPath.indexOf('mod-list.json'));

    gamePath = this.promptForGamePath(electron);
    if(gamePath === undefined) {
        helpers.log('User cancelled the dialog search.');
        return null;
    }
    else if(gamePath.indexOf('factorio.exe') === -1) {
        helpers.log(`The selected file was not correct. Closing app. File: ${gamePath}`);
        return null;
    }

    playerDataPath = this.promptForPlayerDataPath(electron);
    if(playerDataPath === undefined) {
        helpers.log('User cancelled the dialog search.');
        return null;
    }
    else if(playerDataPath.indexOf('player-data.json') === -1) {
        helpers.log(`The selected file was not correct. Closing app. File: ${playerDataPath}`);
        return null;
    }

    let data = {
        'minWidth': screenWidth / 2,
        'minHeight': screenHeight / 1.25,
        'width': screenWidth / 2,
        'height': screenHeight,
        'x_loc': 0,
        'y_loc': 0,
        'mod_directory_path': modDirectoryPath,
        'modlist_path': modListPath,
        'game_path': gamePath,
        'player_data_path': playerDataPath
    };

    try {
        file.writeFileSync(this.configPath, JSON.stringify(data, null, 4));
    }
    catch(error) { // TODO: Handle unexpected errors more appropriately?
        helpers.log(`Unhandled error saving config file. Error: ${error.message}`);
        throw error;
        return null;
    }

    return this.loadConfig(electron, screenWidth, screenHeight);
};

AppManager.prototype.loadAppMetaInfo = function() {
    let file = require('fs');
    let path = require('path');
    let filePath = path.join(__dirname, '..', 'package.json');

    try {
        let data = file.readFileSync(filePath, 'utf8');
        data = JSON.parse(data);
        return data;
    }
    catch(error) {
        helpers.log(`Unhandled error loading package.json file. Error: ${error.message}`);
        return null;
    }
};

//---------------------------------------------------------
// Online calls

AppManager.prototype.fetchLatestAppInfo = function() {
    let request = require('request');
    let options = {
        'url': 'https://api.github.com/repos/AlyxMoon/lunars-factorio-mod-manager/releases/latest',
        'headers': {
            'User-Agent': 'request'
        }
    };

    let version = this.latestVersion;
    let versionLink = this.latestVersionLink;
    let downloadURL = this.latestVersionDownloadURL;

    request(options, (error, response, data) => {
        if(!error && response.statusCode == 200) {
            data = JSON.parse(data);
            this.latestVersion = data.tag_name.slice(1) // Cut off the v at beginning
            this.latestVersionLink = data.html_url;
            this.latestVersionDownloadURL = data.assets[0].browser_download_url;

        }
        else {
            if(error) helpers.log(`Error fetching latest app version. Error: ${error.message}`);
            if(response) helpers.log(`Error fetching latest app version. Response: ${response.statusCode}`);
        }

    });
};

//---------------------------------------------------------
// Startup-related functions

AppManager.prototype.promptForModlist = function(electron) {
    helpers.log('Attempting to find Factorio mod list.');
    let file = require('fs');
    let path = require('path');

    //------------------------------
    // Guess for common file locations first - Windows
    let windowsPaths = [];
    windowsPaths.push(path.join(electron.app.getPath('appData'), 'Factorio', 'mods', 'mod-list.json'));
    windowsPaths.push(path.join('C:\\', 'Program Files', 'Factorio', 'mods', 'mod-list.json'));
    windowsPaths.push(path.join('C:\\', 'Program Files (x86)', 'Factorio', 'mods', 'mod-list.json'));

    for(let i = 0, length = windowsPaths.length; i < length; i++) {
        try {
            file.readFileSync(windowsPaths[i], 'utf8');
            helpers.log(`Found mod-list.json automatically: ${windowsPaths[i]}`);
            return windowsPaths[i];
        }
        catch(error) { if(error.code !== 'ENOENT') return undefined; }
    }

    //------------------------------
    // Prompt if we didn't find anything
    helpers.log('Could not find automatically, prompting user for file location.');
    let options = {
        'title': 'Find location of mod-list.json file',
        'properties': ['openFile'],
        'filters': [{'name': 'Factorio Mod List', 'extensions': ['json']}]
    };

    let modlistPath = electron.dialog.showOpenDialog(options);

    if(modlist) return modlist[0];
    else return undefined;
};

AppManager.prototype.promptForGamePath = function(electron) {
    helpers.log('Attempting to find Factorio.exe file.');
    let file = require('fs');
    let path = require('path');

    //------------------------------
    // Guess for common file locations first - Windows
    let windowsPaths = [];
    windowsPaths.push(path.join('C:\\', 'Program Files', 'Factorio', 'bin', 'Win32', 'factorio.exe'));
    windowsPaths.push(path.join('C:\\', 'Program Files', 'Factorio', 'bin', 'x64', 'factorio.exe'));
    windowsPaths.push(path.join('C:\\', 'Program Files (x86)', 'Factorio', 'bin', 'Win32', 'factorio.exe'));
    windowsPaths.push(path.join('C:\\', 'Program Files (x86)', 'Factorio', 'bin', 'x64', 'factorio.exe'));
    windowsPaths.push(path.join('C:\\', 'Program Files', 'Steam', 'SteamApps', 'common', 'Factorio', 'bin', 'Win32', 'factorio.exe'));
    windowsPaths.push(path.join('C:\\', 'Program Files', 'Steam', 'SteamApps', 'common', 'Factorio', 'bin', 'x64', 'factorio.exe'));
    windowsPaths.push(path.join('C:\\', 'Program Files (x86)', 'Steam', 'SteamApps', 'common', 'Factorio', 'bin', 'Win32', 'factorio.exe'));
    windowsPaths.push(path.join('C:\\', 'Program Files (x86)', 'Steam', 'SteamApps', 'common', 'Factorio', 'bin', 'x64', 'factorio.exe'));

    for(let i = 0, length = windowsPaths.length; i < length; i++) {
        try {
            file.readFileSync(windowsPaths[i], 'utf8');
            helpers.log(`Found Factorio.exe automatically: ${windowsPaths[i]}`);
            return windowsPaths[i];
        }
        catch(error) { if(error.code !== 'ENOENT') return undefined; }
    }

    //------------------------------
    // Prompt if we didn't find anything
    helpers.log('Could not find automatically, prompting user for file location.');
    let options = {
        'title': 'Find location of Factorio.exe file',
        'properties': ['openFile'],
        'filters': [{'name': 'Factorio Executable', 'extensions': ['exe']}]
    };

    let gamePath = electron.dialog.showOpenDialog(options);

    if(gamePath) return gamePath[0];
    else return undefined;
};

AppManager.prototype.promptForPlayerDataPath = function(electron) {
    helpers.log('Attempting to find player-data.json file.');
    let file = require('fs');
    let path = require('path');

    //------------------------------
    // Guess for common file locations first - Windows
    let windowsPaths = [];
    windowsPaths.push(path.join(electron.app.getPath('appData'), 'Factorio', 'player-data.json'));
    windowsPaths.push(path.join(electron.app.getPath('appData'), 'Factorio', 'config', 'player-data.json'));
    windowsPaths.push(path.join('C:\\', 'Program Files', 'Factorio', 'mods', 'mod-list.json'));
    windowsPaths.push(path.join('C:\\', 'Program Files (x86)', 'Factorio', 'mods', 'mod-list.json'));

    for(let i = 0, length = windowsPaths.length; i < length; i++) {
        try {
            file.readFileSync(windowsPaths[i], 'utf8');
            helpers.log(`Found player-data.json automatically: ${windowsPaths[i]}`);
            return windowsPaths[i];
        }
        catch(error) { if(error.code !== 'ENOENT') return undefined; }
    }

    //------------------------------
    // Prompt if we didn't find anything
    let options = {
        'title': 'Find location of player-data.json file',
        'properties': ['openFile'],
        'filters': [{'name': 'Factorio Player Data', 'extensions': ['json']}]
    };

    let gamePath = electron.dialog.showOpenDialog(options);

    if(gamePath) return gamePath[0];
    else return undefined;
};

//---------------------------------------------------------
// Application-finishing functions

AppManager.prototype.startGame = function(app, profileManager) {
    helpers.log('Starting Factorio and shutting down app.');

    let spawn = require('child_process').spawn;
    let factorioPath = config.game_path.slice(0, config.game_path.indexOf('factorio.exe'));

    profileManager.updateFactorioModlist();
    spawn('factorio.exe', [], {
        'stdio': 'ignore',
        'detached': true,
        'cwd': factorioPath
    }).unref();
    this.closeProgram(app, config, profileManager);
};

AppManager.prototype.closeProgram = function(app, profileManager, inError = false) {
    if(inError) {
        helpers.log('There was an error. Not saving app data, closing app.');
        app.exit(-1);
    }
    else {
        helpers.log('Beginning application shutdown.');
        this.saveConfig();
        profileManager.saveProfiles();
        profileManager.updateFactorioModlist();
        helpers.log('Everything taken care of, closing app now.');
        app.quit();
    }
};

//---------------------------------------------------------
// Miscellaneous logic and helpers

AppManager.prototype.createWindow = function(screenWidth, screenHeight) {
    helpers.log('Creating the application window');
    const BrowserWindow = require('electron').BrowserWindow;
    let config = this.config;

    let windowOptions = {
        minWidth: screenWidth / 2,
        minHeight: screenHeight / 1.25,
        width: config.width,
        height: config.height,
        x: config.x_loc,
        y: config.y_loc,
        resizable: true,
        title: 'Lunar\'s [Factorio] Mod Manager',
        icon: `${__dirname}/../view/img/favicon.ico`
    };

    let window = new BrowserWindow(windowOptions);
    window.setMenu(null);
    if(this.config['debug'] === true) window.webContents.openDevTools();

    window.on('closed', function () {
        window = null;
    });

    helpers.log('Window created successfully, event registered');
    return window;
};

AppManager.prototype.loadPage = function(window, page, profileManager, modManager) {
    helpers.log(`Attempting to change the page to ${page}`);

    switch(page) {
        case 'page_profiles':
        case 'page_installedMods':
        case 'page_onlineMods':
        case 'page_about':
            window.loadURL(`file://${__dirname}/../view/${page}.html`);
            break;
        default:
            helpers.log('The given page is not set up yet. Loading profiles page instead.');
            window.loadURL(`file://${__dirname}/../view/page_profiles.html`);;
    }

};