const fs = require('fs')
const storage = require('electron-json-storage')

const helpers = require('./helpers.js')
const logger = require('./logger.js')

module.exports = ProfileManager
// ---------------------------------------------------------
// Primary class declaration
function ProfileManager(modlistPath) {
  this.modlistPath = modlistPath
  logger.log(1, `Created ProfileManager with modlistPath = ${modlistPath}`)
}

// ---------------------------------------------------------
// Getters / Setters
ProfileManager.prototype.getActiveProfile = function() {
  logger.log(0, 'ProfileManager.getActiveProfile() called.')
  return this.profileList['active-profile']
}

ProfileManager.prototype.getAllProfiles = function() {
  logger.log(0, 'ProfileManager.getAllProfiles() called.')
  return this.profileList['all-profiles']
}

// ---------------------------------------------------------
// File Management

ProfileManager.prototype.loadProfiles = function() {
  return new Promise((resolve, reject) => {
    logger.log(1, 'Beginning to load the profiles list')
    let data = {
      'all-profiles': {},
      'active-profile': {}
    }

    storage.get('profileManager', (error, file) => {
      if (error) reject(error);

      try {
        // If the config file is empty, build a new one
        if (Object.keys(file).length === 0 && file.constructor === Object) {
          return this.buildProfilesFile()
        } else {
          data['all-profiles'] = file
          for (let i = data['all-profiles'].length - 1; i >= 0; i--) {
            if (data['all-profiles'][i]['enabled']) {
              data['active-profile'] = data['all-profiles'][i]
              break
            }
          }
          logger.log(1, 'Finished loading the profiles successfully.')
          this.profileList = data
          resolve(data)
        }
      } catch (error) {
        logger.log(4, `Error: cannot load profileManager config! ${error} (${JSON.stringify(file)})`)
        return this.buildProfilesFile()
      }
    })
  })
}

ProfileManager.prototype.saveProfiles = function() {
  return new Promise((resolve, reject) => {
    logger.log(1, 'Beginning to save the profiles.')

    storage.set('profileManager', this.profileList['all-profiles'], (error) => {
      if (error) {
        reject(error)
      } else {
        logger.log(1, `Saved profileManager config file`)
        resolve()
      }
    });

    logger.log(1, 'Finished saving the profiles.')
  })
}

ProfileManager.prototype.buildProfilesFile = function() {
  return new Promise((resolve, reject) => {
    let data = fs.readFileSync(this.modlistPath, 'utf8')
    let mods = JSON.parse(data)['mods']

    let profile = [{
      'name': 'Current Profile',
      'enabled': true,
      'mods': mods
    }]

    storage.set('profileManager', profile, (error) => {
      if (error) {
        reject(error)
      } else {
        logger.log(1, `Saved profileManager config file`)
        return this.loadProfiles()
      }
    })
  })
}

ProfileManager.prototype.updateFactorioModlist = function() {
  logger.log(1, 'Beginning to save current mod configuration.')
  let modList = {
    'mods': this.profileList['active-profile']['mods']
  }

  fs.writeFileSync(this.modlistPath, JSON.stringify(modList, null, 4))

  logger.log(1, 'Finished saving current mod configuration.')
}

// ---------------------------------------------------------
// Profile Management

ProfileManager.prototype.createProfile = function(modNames) {
  logger.log(1, 'Attempting to create a new profile')
  let profiles = this.profileList['all-profiles']

  let newProfile = {
    'name': 'New Profile',
    'enabled': false,
    'mods': []
  }
  for (let i = 0; i < modNames.length; i++) {
    newProfile['mods'].push({
      'name': modNames[i],
      'enabled': 'true'
    })
  }

  let n = 1
  while (true) {
    let nameExists = false
    for (let j = 0; j < profiles.length; j++) {
      if (profiles[j]['name'] === newProfile['name'] + ' ' + n) {
        nameExists = true
        n++
        break
      }
    }
    if (!nameExists) {
      newProfile['name'] = newProfile['name'] + ' ' + n
      break
    }
  }
  logger.log(1, `Successfully created new profile: ${newProfile['name']}`)
  profiles.push(newProfile)
}

ProfileManager.prototype.activateProfile = function(index) {
  logger.log(1, `Attempting to change active profile to profile at index ${index}`)
  let profiles = this.profileList['all-profiles']
  let activeProfile = this.profileList['active-profile']

  if (index >= 0 && index < profiles.length) {
    for (let i = 0; i < profiles.length; i++) {
      profiles[i].enabled = (i === index)
    }
    activeProfile = profiles[index]
  } else {
    logger.log(2, 'Given profile index out of range, nothing will be done')
  }

  this.profileList['all-profiles'] = profiles
  this.profileList['active-profile'] = activeProfile
  logger.log(1, `Active profile changed, new active profile: ${activeProfile['name']}`)
}

ProfileManager.prototype.renameProfile = function(index, newName) {
  logger.log(1, `Attempting to rename profile at index ${index} to ${newName}`)
  let profiles = this.profileList['all-profiles']

  if (index >= 0 && index < profiles.length) {
    this.profileList['all-profiles'][index].name = newName
    logger.log(1, 'Name change successful.')
  } else {
    logger.log(2, 'Index out of bounds, unable to change name.')
  }
}

ProfileManager.prototype.deleteProfile = function(index, modNames) {
  logger.log(1, `Attempting to delete profile at index ${index}`)
  let profiles = this.profileList['all-profiles']
  let wasActiveProfile = profiles[index].enabled

  if (index >= 0 && index < profiles.length) {
    profiles.splice(index, 1)
    if (profiles.length === 0) this.createProfile(modNames)

    if (wasActiveProfile) {
      profiles[0].enabled = true
      this.profileList['active-profile'] = profiles[0]
    }

    logger.log(1, `Successfully deleted profile. New active profile: ${this.profileList['active-profile']['name']}`)
  } else {
    logger.log(2, 'Given profile index out of range, nothing will be done')
  }
}

ProfileManager.prototype.moveProfile = function(index, direction) {
  logger.log(1, `Attempting to move profile at index ${index} ${direction}`)

  let profiles = this.profileList['all-profiles']
  let oldIndex = index

  if (direction === 'up' && index > 0) index -= 1
  else if (direction === 'down' && index < profiles.length - 1) index += 1

  let tempProfile = profiles[index]
  profiles[index] = profiles[oldIndex]
  profiles[oldIndex] = tempProfile

  logger.log(1, `Successfully moved profile at index ${oldIndex} to index ${index}`)
}

ProfileManager.prototype.toggleMod = function(profileIndex, modIndex) {
  logger.log(1, `Attempting to toggle mod with index '${modIndex}'`)
  //TODO Update toggleMod

  /* -------------------------------------------------------
  // Old code. Doesn't work anymore

  let activeProfile = this.profileList['active-profile']
  for (let i = activeProfile['mods'].length - 1; i >= 0; i--) {
    if (activeProfile['mods'][i]['name'] === modName) {
      if (activeProfile['mods'][i]['enabled'] === 'true') {
        activeProfile['mods'][i]['enabled'] = 'false'
      } else {
        activeProfile['mods'][i]['enabled'] = 'true'
      }
      break
    }
  }*/

  // -------------------------------------------------------
  // New code. Might work with new React Client Rendering

  // Using currentProfile instead of this.profileList['active-profile']
  // causes critical errors when loading config files
  let currentProfile = this.profileList['all-profiles'][profileIndex]


  if (this.profileList['active-profile']['mods'][modIndex]['enabled'] === 'true') {
    this.profileList['active-profile']['mods'][modIndex]['enabled'] = 'false'
    logger.log(1, 'Successfully changed mod status to false.')
  } else {
    this.profileList['active-profile']['mods'][modIndex]['enabled'] = 'true'
    logger.log(1, 'Successfully changed mod status to true.')
  }
}

// ---------------------------------------------------------
// Helper and Miscellaneous Logic

ProfileManager.prototype.updateProfilesWithNewMods = function(modNames) {
  logger.log(1, 'Checking for newly installed mods.')

  try {
    let profiles = this.profileList['all-profiles']

    for (let i = 0; i < profiles.length; i++) {
      let profileMods = profiles[i]['mods']
      for (let j = 0; j < modNames.length; j++) {
        let index = -1
        for (let k = 0; k < profileMods.length; k++) {
          if (profileMods[k]['name'] === modNames[j]) {
            index = k
            break
          }
        }

        if (index === -1) {
          logger.log(1, `Found new mod: ${modNames[j]} -- Adding to profile: ${profiles[i]['name']}`)
          profileMods.splice(index, 0, {
            'name': modNames[j],
            'enabled': 'false'
          })
        }
      }
      profileMods = helpers.sortArrayByProp(profileMods, 'name')
    }
    logger.log(1, 'Finished looking for newly installed mods.')
  } catch (error) {
    logger.log(2, `Had error: ${error}`)
  }
}

ProfileManager.prototype.removeDeletedMods = function(modNames) {
  let profiles = this.profileList['all-profiles']

  for (let i = 0; i < profiles.length; i++) {
    let profileMods = profiles[i].mods
    for (let j = 0; j < profileMods.length; j++) {
      let index = modNames.indexOf(profileMods[j].name)
      if (index === -1) {
        logger.log(1, `Removing deleted mod from profile -- Profile: '${profiles[i]['name']}' Mod: '${profileMods[j].name}'`)
        profileMods.splice(j, 1)
        j--
      }
    }
  }
}
