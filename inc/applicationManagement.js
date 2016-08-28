const helpers = require('./helpers.js');
module.exports = {
    Manager: AppManager
};
//---------------------------------------------------------
// Primary class declaration

function AppManager() {

}

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
    else if(page === 'page_localMods') {
        window.loadURL(`file://${__dirname}/../view/${page}.html`);
        window.webContents.once('did-finish-load', function() {
            modManager.sendInstalledMods(window);
        });
    }
    else if(page === 'page_onlineMods') {
        window.loadURL(`file://${__dirname}/../view/${page}.html`);
        window.webContents.once('did-finish-load', function() {
            modManager.sendInstalledMods(window);
            modManager.loadOnlineMods(window);
        });
    }
    else {
        helpers.log('Turns out that page isn\'t set up. Let me know and I\'ll change that.');
    }
};