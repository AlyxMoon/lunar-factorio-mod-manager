const helpers = require('./helpers.js');
module.exports = {
    Manager: AppManager
};
//---------------------------------------------------------
// Primary class declaration

function AppManager(configPath) {

    this.configPath = configPath;
    this.config;

}

//---------------------------------------------------------
// File-Management

AppManager.prototype.loadConfig = function() {
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
            this.buildConfigFile();
        }
        else { // TODO: Handle unexpected errors more appropriately?
            throw error;
            return null;
        }
    }

    //------------------------------
    // Check data for integrity
    try {
        data = JSON.parse(data);
    }
    catch(error) {
        return this.buildConfigFile()
    }

    if(!data.hasOwnProperty('minWidth') || data.minWidth typeof !== 'number') {
        // The value of this property isn't critical, nothing excessive needed
        data.minWidth = 0;
    }
    if(!data.hasOwnProperty('minHeight') || data.minHeight typeof !== 'number') {
        // The value of this property isn't critical, nothing excessive needed
        data.minHeight = 0;
    }
    if(!data.hasOwnProperty('width') || data.width typeof !== 'number') {
        // The value of this property isn't critical, nothing excessive needed
        data.width = 0;
    }
    if(!data.hasOwnProperty('height') || data.height typeof !== 'number') {
        // The value of this property isn't critical, nothing excessive needed
        data.height = 0;
    }
    if(!data.hasOwnProperty('x_loc') || data.x_loc typeof !== 'number') {
        // The value of this property isn't critical, nothing excessive needed
        data.x_loc = 0;
    }
    if(!data.hasOwnProperty('y_loc') || data.y_loc typeof !== 'number') {
        // The value of this property isn't critical, nothing excessive needed
        data.y_loc = 0;
    }

    if(!data.hasOwnProperty('mod_path') || data.mod_path typeof !== 'string') {
        // Give some backward compatibility. Remove in about a month, ~ October 1st
        if(data.hasOwnProperty('mod-path') || data['mod-path'] typeof === 'string') {
            data.mod_path = data['mod-path'].slice();
            delete data['mod-path'];
        }
        else {
            // Critical, can't fudge this one if not there
            return this.buildConfigFile();
        }
    }
    if(!data.hasOwnProperty('modlist_path') || data.modlist_path typeof !== 'string') {
        // Give some backward compatibility. Remove in about a month, ~ October 1st
        if(data.hasOwnProperty('modlist-path') || data['modlist-path'] typeof === 'string') {
            data.modlist_path = data['modlist-path'].slice();
            delete data['modlist-path'];
        }
        else {
            // Critical, can't fudge this one if not there
            return this.buildConfigFile();
        }
    }
    if(!data.hasOwnProperty('game_path') || data.game_path typeof !== 'string') {
        // Give some backward compatibility. Remove in about a month, ~ October 1st
        if(data.hasOwnProperty('game-path') || data['game-path'] typeof === 'string') {
            data.game_path = data['game-path'].slice();
            delete data['game-path'];
        }
        else {
            // Critical, can't fudge this one if not there
            return this.buildConfigFile();
        }
    }

    return data;
};

AppManager.prototype.buildConfigFile = function(electronDialog, screenWidth, screenHeight) {
    let file = require('fs');
    let modListPath, modDirectoryPath, gamePath;

    //------------------------------
    // Check data for integrity
    if(screenWidth === undefined || screenWidth typeof !== 'number' || screenWidth <= 0) {
        // Guess for a lower resolution
        sceenWidth = 1280;
    }
    if(screenHeight === undefined || screenHeight typeof !== 'number' || screenHeight <= 0) {
        // Guess for a lower resolution
        screenHeight = 720;
    }

    modListPath = this.promptForModlist(electronDialog);
    if(modListPath === undefined) {
        helpers.log('User cancelled the dialog search.');
        return false;
    }
    else if(modListPath.indexOf('mod-list.json') === -1) {
        helpers.log('The selected file was not correct. Closing app.');
        return false;
    }
    modDirectoryPath = modListPath.slice(0, modListPath.indexOf('mod-list.json'));

    gamePath = this.promptForGamePath(electron.dialog);
    if(gamePath === undefined) {
        helpers.log('User cancelled the dialog search.');
        return false;
    }
    else if(gamePath.indexOf('factorio.exe') === -1) {
        helpers.log('The selected file was not correct. Closing app.');
        return false;
    }

    let data = {
        'minWidth': screenWidth / 2,
        'minHeight': screenHeight / 1.25,
        'width': screenSize.width / 2,
        'height': screenSize.height,
        'x-loc': 0,
        'y-loc': 0,
        'mod_directory_path': modDirectoryPath,
        'modlist_path': modListPath,
        'game_path': gamePath
    };

    try {
        file.writeFileSync(this.configPath, JSON.stringify(data, null, 4));
    }
    catch(error) { // TODO: Handle unexpected errors more appropriately?
        throw error;
        return false;
    }

    return this.loadConfig();
};

//---------------------------------------------------------
// Startup-related functions

AppManager.prototype.promptForModlist = function(dialog) {
    helpers.log('Prompting user for Factorio modlist.json file.');

    let options = {
        'title': 'Find location of mod-list.json file',
        'properties': ['openFile'],
        'filters': [{'name': 'Factorio Mod List', 'extensions': ['json']}]
    };

    let modlist = dialog.showOpenDialog(options);

    if(modlist) return modlist[0];
    else return undefined;
};

AppManager.prototype.promptForGamePath = function(dialog) {
    helpers.log('Prompting user for Factorio.exe file.');

    let options = {
        'title': 'Find location of Factorio.exe file',
        'properties': ['openFile'],
        'filters': [{'name': 'Factorio Executable', 'extensions': ['exe']}]
    };

    let gamePath = dialog.showOpenDialog(options);

    if(gamePath) return gamePath[0];
    else return undefined;
};



//---------------------------------------------------------
// Application-finishing functions

AppManager.prototype.startGame = function(app, config, profileManager) {
    helpers.log('Starting Factorio and shutting down app.');

    let spawn = require('child_process').spawn;
    let factorioPath = config['game-path'].slice(0, config['game-path'].indexOf('factorio.exe'));

    profileManager.updateFactorioModlist();
    spawn('factorio.exe', [], {
        'stdio': 'ignore',
        'detached': true,
        'cwd': factorioPath
    }).unref();
    this.closeProgram(app, config, profileManager);
};

AppManager.prototype.closeProgram = function(app, config, profileManager, inError = false) {
    if(inError) {
        helpers.log('There was an error. Not saving app data, closing app.');
        app.exit(-1);
    }
    else {
        helpers.log('Beginning application shutdown.');
        profileManager.saveProfiles();
        profileManager.updateFactorioModlist();
        helpers.log('Everything taken care of, closing app now.');
        app.quit();
    }
};

//---------------------------------------------------------
// Miscellaneous logic and helpers

AppManager.prototype.createWindow = function(appConfig) {
    helpers.log('Creating the application window');
    const BrowserWindow = require('electron').BrowserWindow;

    let windowOptions = {
        minWidth: appConfig['minWidth'],
        minHeight: appConfig['minHeight'],
        width: appConfig['width'],
        height: appConfig['height'],
        x: appConfig['x-loc'],
        y: appConfig['y-loc'],
        resizable: true,
        title: 'Lunar\'s [Factorio] Mod Manager',
        icon: __dirname + '/../img/favicon.ico'
    };

    let window = new BrowserWindow(windowOptions);
    window.setMenu(null);
    if(appConfig['debug'] === true) window.webContents.openDevTools();

    window.on('closed', function () {
        window = null;
    });

    helpers.log('Window created successfully, event registered');
    return window;
};

AppManager.prototype.loadPage = function(window, page, profileManager, modManager) {
    helpers.log(`Attempting to change the page to ${page}`);

    if(page === 'page_profiles') {
        window.loadURL(`file://${__dirname}/../view/${page}.html`);
        window.webContents.once('did-finish-load', function() {
            profileManager.sendActiveProfile(window);
            profileManager.sendAllProfiles(window);
        });
    }
    else if(page === 'page_installedMods') {
        window.loadURL(`file://${__dirname}/../view/${page}.html`);
    }
    else if(page === 'page_onlineMods') {
        window.loadURL(`file://${__dirname}/../view/${page}.html`);
    }
    else {
        helpers.log('Turns out that page isn\'t set up. Let me know and I\'ll change that.');
    }
    window.webContents.once('did-finish-load', function() {
        modManager.sendOnlineMods(window);
    });
};