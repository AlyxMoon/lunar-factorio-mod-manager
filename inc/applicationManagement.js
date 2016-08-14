const helpers = require('./helpers.js');
const fileHandlers = require('./fileHandling.js');

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
    }

};