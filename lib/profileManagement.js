const fs = require('fs');

const helpers = require('./helpers.js');
const logger = require('./logger.js');

module.exports = ProfileManager;
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
    logger.log(1, 'Beginning to load the profiles list');
    let data = {
        'all-profiles': {},
        'active-profile': {}
    };

    try {
        data['all-profiles'] = fs.readFileSync(this.profilesPath, 'utf8')
    }
    catch(error) {
        if(error.code === 'ENOENT') {
            logger.log(2, 'Was not able to find profiles file. Creating.');
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
    logger.log(1, 'Finished loading the profiles successfully.');
    return data;
};

ProfileManager.prototype.saveProfiles = function() {
    logger.log(1, 'Beginning to save the profiles.');

    fs.writeFileSync(this.profilesPath, JSON.stringify(this.profileList['all-profiles'], null, 4));

    logger.log(1, 'Finished saving the profiles.');
};

ProfileManager.prototype.buildProfilesFile = function() {
    let data = fs.readFileSync(this.modlistPath, 'utf8');
    let mods = JSON.parse(data)['mods'];

    let profile = [{
        'name': 'Current Profile',
        'enabled': true,
        'mods': mods
    }];

    fs.writeFileSync(this.profilesPath, JSON.stringify(profile, null, 4));
    return this.loadProfiles();
};

ProfileManager.prototype.updateFactorioModlist = function() {
    logger.log(1, 'Beginning to save current mod configuration.');
    let modList = { 'mods': this.profileList['active-profile']['mods'] };

    fs.writeFileSync(this.modlistPath, JSON.stringify(modList, null, 4));

    logger.log(1, 'Finished saving current mod configuration.');
};

//---------------------------------------------------------
// Profile Management

ProfileManager.prototype.createProfile = function(modNames) {
    logger.log(1, 'Attempting to create a new profile');
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
    logger.log(1, `Successfully created new profile: ${newProfile['name']}`);
    profiles.push(newProfile);
};

ProfileManager.prototype.activateProfile = function(profileName) {
    logger.log(1, 'Attempting to change active profile.');
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
        logger.log(1, `Active profile changed, new active profile: ${activeProfile['name']}`);
};

ProfileManager.prototype.renameActiveProfile = function(newName) {
    logger.log(1, 'Attempting to rename active profile.');
    let activeProfile = this.profileList['active-profile'];
    activeProfile.name = newName;

    logger.log(1, `Active profile name changed to: ${activeProfile['name']}`);
};

ProfileManager.prototype.deleteActiveProfile = function(modNames) {
    logger.log(1, `Attempting to delete active profile`);
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

    logger.log(1, `Successfully deleted profile. New active profile: ${this.profileList['active-profile']['name']}`);
};

ProfileManager.prototype.moveActiveProfile = function(direction) {
    logger.log(1, `Attempting to move profile '${this.profileList['active-profile']['name']}' ${direction}`);

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
            logger.log(1, 'Profile has been moved up the list.');
        }
        else {
            logger.log(0, 'No need to move profile up the list, already on top.');
        }
    }
    else if(direction === 'down') {
        if(index < profiles.length - 1) {
            let tempProfile = profiles[index + 1];
            profiles[index + 1] = profiles[index];
            profiles[index] = tempProfile;
            logger.log(1, 'Profile has been moved down the list.');
        }
        else {
            logger.log(0, 'No need to move profile down the list, already on bottom.');
        }
    }

    logger.log(1, `Successfully moved profile '${this.profileList['active-profile']['name']}' to index ${index}`);
};

ProfileManager.prototype.toggleMod = function(modName) {
    logger.log(1, `Attempting to toggle mod '${modName}'`);

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
    logger.log(1, 'Successfully changed mod status.');
};

//---------------------------------------------------------
// Helper and Miscellaneous Logic

ProfileManager.prototype.updateProfilesWithNewMods = function(modNames) {
    logger.log(1, 'Checking for newly installed mods.');

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
                    logger.log(1, `Found new mod: ${modNames[j]} -- Adding to profile: ${profiles[i]['name']}`);
                    profileMods.splice(index, 0, {'name': modNames[j], 'enabled': 'false'});
                }
            }
            profileMods = helpers.sortArrayByProp(profileMods, 'name');
        }
        logger.log(1, 'Finished looking for newly installed mods.');
    }
    catch(error) {
        logger.log(2, `Had error: ${error}`);
    }

};

ProfileManager.prototype.removeDeletedMods = function(modNames) {
    let profiles = this.profileList['all-profiles'];

    for(let i = 0; i < profiles.length; i++) {

        let profileMods = profiles[i].mods;
        for(let j = 0; j < profileMods.length; j++) {

            let index = modNames.indexOf(profileMods[j].name);
            if(index === -1) {
                logger.log(1, `Removing deleted mod from profile -- Profile: '${profiles[i]['name']}' Mod: '${profileMods[j].name}'`);
                profileMods.splice(j, 1);
                j--;
            }
        }
    }
};