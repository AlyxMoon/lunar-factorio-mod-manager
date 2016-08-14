const helpers = require('./helpers.js');
const fileHandlers = require('./fileHandling.js');
const profileHandlers = require('./profileManagement.js');
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

    closeProgram: function (app, config, appData, inError = false) {
        if(inError) {
            helpers.log('There was an error. Not saving app data, closing app.');
            app.exit(-1);
        }
        else {
            helpers.log('Beginning application shutdown.');
            fileHandlers.saveProfiles(config['profiles-path'], appData['profiles']);
            fileHandlers.setProfileAsModlist(config['modlist-path'], appData['active-profile']);
            helpers.log('Everything taken care of, closing app now.');
            app.quit();
        }
    },


    loadPage: function(window, page, appData) {
        helpers.log(`Attempting to change the page to ${page}`);

        if(page === 'page_profiles') {
            window.loadURL(`file://${__dirname}/../view/${page}.html`);
            window.webContents.once('did-finish-load', function() {
                profileHandlers.showActiveProfile(window, appData['active-profile']);
                profileHandlers.showAllProfiles(window, appData['profiles']);
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