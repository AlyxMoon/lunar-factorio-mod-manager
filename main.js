const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;
function createWindow () {
    mainWindow = new BrowserWindow({width: 800, height: 600});

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    mainWindow.webContents.on('did-finish-load', getCurrentModConfig);

}

function getCurrentModConfig() {
    var file = require('fs');
    var filepath = app.getPath('appData') + '\\Factorio\\mods\\mod-list.json';

    mainWindow.webContents.openDevTools();
    file.readFile(filepath, 'utf8', function(err, data) {
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
