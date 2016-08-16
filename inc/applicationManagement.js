const helpers = require('./helpers.js');
const fileHandlers = require('./fileHandling.js');
const modHandlers = require('./modManagement.js');

module.exports = {

    startGame: function(app, config, appData) {
        helpers.log('Starting Factorio and shutting down app.');

        let spawn = require('child_process').spawn;
        let factorioPath = config['game-path'].slice(0, config['game-path'].indexOf('factorio.exe'));

        fileHandlers.setProfileAsModlist(config['modlist-path'], appData['active-profile']);
        spawn('factorio.exe', [], {
            'stdio': 'ignore',
            'detached': true,
            'cwd': factorioPath
        }).unref();
        module.exports.closeProgram(app, config, appData);
    },

    closeProgram: function(app, config, profileManager, inError = false) {
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
    },

    createWindow: function(appConfig, data) {
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
        window.webContents.openDevTools();

        window.on('closed', function () {
            window = null;
        });
        //window.webContents.session.on('will-download', manageDownload);

        helpers.log('Window created successfully, event registered');
        return window;
    },

    loadPage: function(window, page, profileManager) {
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
                modHandlers.showInstalledMods(window, appData['modNames']);
            });
        }
        else if(page === 'page_onlineMods') {
            window.loadURL(`file://${__dirname}/../view/${page}.html`);
            // TODO: Do not use in app until we've put in this functionality
            //window.webContents.once('did-finish-load', showOnlineMods);
        }
        else {
            helpers.log('Turns out that page isn\'t set up. Let me know and I\'ll change that.');
        }
    }

};