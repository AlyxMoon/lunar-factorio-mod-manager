let helpers = require('./helpers.js');

module.exports = {

    saveProfiles: function (filePath, profiles) {
        helpers.log('Beginning to save the profiles.');
        let file = require('fs');

        file.writeFileSync(filePath, JSON.stringify(profiles));

        helpers.log('Finished saving the profiles.');
    },

    loadProfiles: function(filePath) {
        helpers.log('Beginning to load the profiles list');
        let file = require('fs');
        let profileStorage = {
            'profiles': {},
            'active-profile': {}
        };

        profileStorage['profiles'] = JSON.parse(file.readFileSync(filePath, 'utf8'));

        for(let i = profileStorage['profiles'].length - 1; i >= 0; i--) {
            if(profileStorage['profiles'][i]['enabled']) {
                profileStorage['active-profile'] = profileStorage['profiles'][i];
                break;
            }
        }
        helpers.log('Finished loading the profiles successfully.');
        return profileStorage;
    },

    setProfileAsModlist: function(filePath, profile) {
        helpers.log('Beginning to save current mod configuration.');
        let file = require('fs');
        let modList = { 'mods': profile['mods'] };

        file.writeFileSync(filePath, JSON.stringify(modList));

        helpers.log('Finished saving current mod configuration.');
    }
};
