const helpers = require('./helpers.js');
module.exports = {
    Manager: ProfileManager
};
//---------------------------------------------------------
// Primary class declaration

function ProfileManager(profilesPath, modlistPath) {

    this.profilesPath = profilesPath;
    this.modlistPath = modlistPath;


    this.profileList = this.loadProfiles();
}

//---------------------------------------------------------
// Sending data to the client

ProfileManager.prototype.sendActiveProfile = function(window) {
    window.webContents.send('dataActiveProfile', this.profileList['active-profile']);
};

ProfileManager.prototype.sendAllProfiles = function(window) {
    window.webContents.send('dataAllProfiles', this.profileList['all-profiles']);
};

//---------------------------------------------------------
// File Management

ProfileManager.prototype.loadProfiles = function() {
    helpers.log('Beginning to load the profiles list');
    let file = require('fs');
    let data = {
        'all-profiles': {},
        'active-profile': {}
    };

    try {
        data['all-profiles'] = file.readFileSync(this.profilesPath, 'utf8')
    }
    catch(error) {
        if(error.code === 'ENOENT') {
            helpers.log('Was not able to find profiles file. Creating.');
            return this.buildProfilesFile();
        }
    }

    data['all-profiles'] = JSON.parse(data['all-profiles']);

    for(let i = data['all-profiles'].length - 1; i >= 0; i--) {
        if(data['all-profiles'][i]['enabled']) {
            data['active-profile'] = data['all-profiles'][i];
            break;
        }
    }
    helpers.log('Finished loading the profiles successfully.');
    return data;
};

ProfileManager.prototype.saveProfiles = function() {
    helpers.log('Beginning to save the profiles.');

    let file = require('fs');
    file.writeFileSync(this.profilesPath, JSON.stringify(this.profileList['all-profiles'], null, 4));

    helpers.log('Finished saving the profiles.');
};

ProfileManager.prototype.buildProfilesFile = function() {
    let file = require('fs');

    let data = file.readFileSync(this.modListPath, 'utf8');
    let mods = JSON.parse(data)['mods'];

    let profile = [{
        'name': 'Current Profile',
        'enabled': true,
        'mods': mods
    }];

    file.writeFileSync(this.profilesPath, JSON.stringify(profile, null, 4));
    return this.loadProfiles();
};

ProfileManager.prototype.updateFactorioModlist = function() {
    helpers.log('Beginning to save current mod configuration.');
    let file = require('fs');
    let modList = { 'mods': this.profileList['active-profile']['mods'] };

    file.writeFileSync(this.modlistPath, JSON.stringify(modList, null, 4));

    helpers.log('Finished saving current mod configuration.');
};

//---------------------------------------------------------
// Profile Management

ProfileManager.prototype.createProfile = function(modNames) {
    helpers.log('Attempting to create a new profile');
    let profiles = this.profileList['all-profiles'];

    let newProfile = {
        'name': 'New Profile',
        'enabled': false,
        'mods': []
    };
    for(let i = 0; i < modNames.length; i++) {
        newProfile['mods'].push({
            'name': modNames[i],
            'enabled': 'true'
        });
    }

    let n = 1;
    while(true) {
        let nameExists = false;
        for(let j = 0; j < profiles.length; j++) {
            if(profiles[j]['name'] === newProfile['name'] + ' ' + n) {
                nameExists = true;
                n++;
                break;
            }
        }
        if(!nameExists) {
            newProfile['name'] = newProfile['name'] + ' ' + n;
            break;
        }
    }
    helpers.log(`Successfully created new profile: ${newProfile['name']}`);
    profiles.push(newProfile);
};

ProfileManager.prototype.activateProfile = function(profileName) {
    helpers.log('Attempting to change active profile.');
    let profiles = this.profileList['all-profiles'];
    let activeProfile = this.profileList['active-profile'];

    for(let i = 0; i < profiles.length; i++) {
        if(profiles[i]['name'] === profileName) {
            profiles[i]['enabled'] = true;
            activeProfile = profiles[i];
        }
        else profiles[i]['enabled'] = false;
    }

    this.profileList['all-profiles'] = profiles;
    this.profileList['active-profile'] = activeProfile;
        helpers.log(`Active profile changed, new active profile: ${activeProfile['name']}`);
};

ProfileManager.prototype.renameActiveProfile = function(newName) {
    helpers.log('Attempting to rename active profile.');
    let activeProfile = this.profileList['active-profile'];
    activeProfile.name = newName;

    helpers.log(`Active profile name changed to: ${activeProfile['name']}`);
};

ProfileManager.prototype.deleteActiveProfile = function(modNames) {
    helpers.log(`Attempting to delete active profile`);
    let profiles = this.profileList['all-profiles'];

    for(let i = 0; i < profiles.length; i++) {
        if(profiles[i]['enabled']) {
            profiles.splice(i, 1);
            break;
        }
    }

    if(profiles.length === 0) {
        this.createProfile(modNames);
    }
    profiles[0]['enabled'] = true;
    this.profileList['active-profile'] = profiles[0];

    helpers.log(`Successfully deleted profile. New active profile: ${this.profileList['active-profile']['name']}`);
};

ProfileManager.prototype.moveActiveProfile = function(direction) {
    helpers.log(`Attempting to move profile '${this.profileList['active-profile']['name']}' ${direction}`);

    let profiles = this.profileList['all-profiles'];

    let index = 0;
    for(let i = 0; i < profiles.length; i++) {
        if(profiles[i]['enabled']) {
            index = i;
            break;
        }
    }

    if(direction === 'up') {
        if(index > 0) {
            let tempProfile = profiles[index - 1];
            profiles[index - 1] = profiles[index];
            profiles[index] = tempProfile;
            helpers.log('Profile has been moved up the list.');
        }
        else {
            helpers.log('No need to move profile up the list, already on top.');
        }
    }
    else if(direction === 'down') {
        if(index < profiles.length - 1) {
            let tempProfile = profiles[index + 1];
            profiles[index + 1] = profiles[index];
            profiles[index] = tempProfile;
            helpers.log('Profile has been moved down the list.');
        }
        else {
            helpers.log('No need to move profile down the list, already on bottom.');
        }
    }

    helpers.log(`Successfully moved profile '${this.profileList['active-profile']['name']}' to index ${index}`);
};

ProfileManager.prototype.toggleMod = function(modName) {
    helpers.log(`Attempting to toggle mod '${modName}'`);

    let activeProfile = this.profileList['active-profile'];
    for(let i = activeProfile['mods'].length - 1; i >= 0; i--) {
        if (activeProfile['mods'][i]['name'] === modName) {
            if(activeProfile['mods'][i]['enabled'] === "true") {
                activeProfile['mods'][i]['enabled'] = "false";
            }
            else {
                activeProfile['mods'][i]['enabled'] = "true";
            }
            break;
        }
    }
    helpers.log('Successfully changed mod status.');
};

//---------------------------------------------------------
// Helper and Miscellaneous Logic

ProfileManager.prototype.updateProfilesWithNewMods = function(modNames) {
    helpers.log('Checking for newly installed mods.');

    try {
        let profiles = this.profileList['all-profiles'];

        for(let i = 0; i < profiles.length; i++) {
            let profileMods = profiles[i]['mods'];
            for(let j = 0; j < modNames.length; j++) {

                let index = -1;
                for(let k = 0; k < profileMods.length; k++) {
                    if(profileMods[k]['name'] === modNames[j]) {
                        index = k;
                        break;
                    }
                }

                if(index === -1) {
                    helpers.log(`Found new mod: ${modNames[j]} -- Adding to profile: ${profiles[i]['name']}`);
                    profileMods.splice(index, 0, {'name': modNames[j], 'enabled': 'false'});
                }
            }
            profileMods = helpers.sortArrayByProp(profileMods, 'name');
        }
        helpers.log('Finished looking for newly installed mods.');
    }
    catch(error) {
        helpers.log(`Had error: ${error}`);
    }

};

ProfileManager.prototype.removeDeletedMods = function(modNames) {
    let profiles = this.profileList['all-profiles'];

    for(let i = 0; i < profiles.length; i++) {

        let profileMods = profiles[i].mods;
        for(let j = 0; j < profileMods.length; j++) {

            let index = modNames.indexOf(profileMods[j].name);
            if(index === -1) {
                helpers.log(`Removing deleted mod from profile -- Profile: '${profiles[i]['name']}' Mod: '${profileMods[j].name}'`);
                profileMods.splice(j, 1);
                j--;
            }
        }
    }
};