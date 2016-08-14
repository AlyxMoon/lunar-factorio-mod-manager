const helpers = require('./helpers.js');

module.exports = {

    showActiveProfile: function(window, profile) {
        window.webContents.send('dataActiveProfile', profile);
    },
    showAllProfiles: function(window, profiles) {
        window.webContents.send('dataAllProfiles', profiles);
    }

};
