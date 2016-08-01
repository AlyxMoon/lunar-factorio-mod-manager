const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;
let config;

function log(data) {
    var file = require('fs');
    file.appendFileSync('./lmm_log.txt', data + '\n');
}

function init() {
    log("Starting up the app");
    var file = require('fs');
    var path = "./lmm_config.json";

    var data;
    try {
        data = file.readFileSync(path, 'utf8');
        config = JSON.parse(data);
    }
    catch(error) {
        if(error.code === 'ENOENT') {
            firstTimeRun();
            data = file.readFileSync(path, 'utf8');
        }
    }
    log("Successfully loaded the config file");


    createWindow();
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
        'mod-path': app.getPath('appData') + '/Factorio/mods'
    };

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

}

function getFactorioModList() {
    var file = require('fs');
    var path = config['mod-path'] + '/mod-list.json';
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

function showProfiles() {
    let file = require('fs');
    let path = './lmm_profiles.json';

    let data = file.readFileSync(path, 'utf8');
    mainWindow.webContents.send('data', JSON.parse(data));
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

    mainWindow.webContents.openDevTools();
    mainWindow.webContents.on('did-finish-load', showProfiles);
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
    var file = require('fs');
    var path = app.getPath('appData') + '/Factorio/mods/mod-list.json';
    log("Checking for mod list at path (for rewrite): " + path);

    file.readFile(path, 'utf8', function(error, data) {
        data = JSON.parse(data);
        for(var i = 0; i < data['mods'].length; i++) {
            if(data['mods'][i]['name'] === message['mod']) {
                data['mods'][i]['enabled'] = message['enabled'];
            }
        }

        file.writeFile(path, JSON.stringify(data));
    });
});