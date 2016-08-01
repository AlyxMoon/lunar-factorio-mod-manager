const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;

function log(data) {
    var file = require('fs');
    file.appendFileSync('lunarsModManager_log.txt', data + '\n');
    mainWindow.webContents.openDevTools();
    mainWindow.webContents.send('ping', data);
}

function showCurrentModList() {
    var file = require('fs');
    var path = app.getPath('appData') + '/Factorio/mods/mod-list.json';
    log("Checking for mod list at path: " + path);

    var data = file.readFileSync(path, 'utf8');
    var profile = [{
        'mods': JSON.parse(data)['mods'],
        'name': 'Current Profile'
    }];
    mainWindow.webContents.send('data', profile);
}

function createWindow () {
    screenSize = electron.screen.getPrimaryDisplay().workAreaSize;

    windowOptions = {
        minWidth: screenSize.width / 2,
        minHeight: screenSize.height,
        width: screenSize.width / 2,
        height: screenSize.height,
        x: 0,
        y: 0,
        resizable: true,
        icon: 'img/favicon.ico'
    };
    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.setMenu(null);

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.webContents.on('did-finish-load', showCurrentModList);
    mainWindow.on('closed', function () {
        mainWindow = null;
    });

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
