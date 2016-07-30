const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;
function createWindow () {
    windowOptions = {
        width: 800,
        height: 600,
        icon: 'img/favicon.ico'
    };
    mainWindow = new BrowserWindow(windowOptions);

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.webContents.openDevTools();
        mainWindow.webContents.send('ping', "All done loading!");
    });

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
