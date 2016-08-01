const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function log(data) {
    file = require('fs');
    file.appendFileSync('./log.txt', data + '\n');
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

    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.webContents.openDevTools();
        mainWindow.webContents.send('ping', "All done loading!");
    });

    log('Successfully loaded the browser!');

    mainWindow.on('closed', function () {
        mainWindow = null;
    })
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
