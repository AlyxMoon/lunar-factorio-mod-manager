const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;

function log(data) {
    var file = require('fs');
    file.appendFileSync('lunarsModManager_log.txt', data + '\n');

    mainWindow.webContents.send('ping', data);
}

function getCurrentModConfig() {
    var file = require('fs');
    var filepath = app.getPath('appData') + '\\Factorio\\mods\\mod-list.json';

    mainWindow.webContents.openDevTools();
    try {
        var data = file.readFileSync(filepath, 'utf8');
        saveProfile(JSON.parse(data));
    }
    catch(error) {
        if (error.code === 'ENOENT') {
            log('Not able to find the Factorio Mod List.');
        }
    }


}

function saveProfile(profile) {
    var file = require('fs');

    var obj = {};
    try {
        var data = file.readFileSync('profiles.json', file.F_OK);
        obj = JSON.parse(data);
    }
    catch(error) {
        if (error.code === 'ENOENT') {
            obj['profiles'] = [];
        }
        else {
            log('Unknown error loading profiles.json file: ' + error.code);
        }
    }


    obj['profiles'].push({'current': profile});
    file.appendFileSync('profiles.json', JSON.stringify(obj));
}


function createWindow () {
    mainWindow = new BrowserWindow({width: 800, height: 600});

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    mainWindow.webContents.on('did-finish-load', getCurrentModConfig);

}



app.on('ready', createWindow);

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
