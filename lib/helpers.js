const moment = require('moment')

module.exports = {

  sortArrayByProp: function (arr, property, property2) {
    let type = null
    if (property2 !== undefined) {
      if (typeof arr[0][property][property2] === 'number') type = 'number'
      else if (typeof arr[0][property][property2] === 'string') type = 'string'
    } else {
      if (typeof arr[0][property] === 'number') type = 'number'
      else if (typeof arr[0][property] === 'string') type = 'string'
    }

    switch (type) {
      case 'string':
        arr.sort(stringSort)
        break
      case 'number':
        arr.sort(numberSort)
        break
    }

    function stringSort (a, b) {
      if (property2 !== undefined) {
        a = a[property][property2].toLowerCase()
        b = b[property][property2].toLowerCase()
      } else {
        a = a[property].toLowerCase()
        b = b[property].toLowerCase()
      }

      if (a < b) return -1
      else if (a > b) return 1
      else return 0
    }
    function numberSort (a, b) {
      if (property2 !== undefined) {
        a = a[property][property2]
        b = b[property][property2]
      } else {
        a = a[property]
        b = b[property]
      }

      if (a < b) return 1
      else if (a > b) return -1
      else return 0
    }

    return arr
  },

    // Trying to make sortArrayByProp generic was proving to be a hindrance
    // Made this to make sorting by update easier now that we have such a large data object for onlineMods
  sortModsByRecentUpdate: function (mods) {
    return mods.sort(function (a, b) {
      a = a.releases[0].released_at
      b = b.releases[0].released_at

      if (moment(a).isBefore(b)) return 1
      else if (moment(a).isAfter(b)) return -1
      else return 0
    })
  },

  isVersionHigher: function (currentVersion, checkedVersion) {
    // Expecting version to be the following format: major.minor.patch
    let version1 = currentVersion.split('.')
    let version2 = checkedVersion.split('.')

    for (let i = 0; i < 3; i++) {
      let temp1 = parseInt(version1[i])
      let temp2 = parseInt(version2[i])
      if (temp1 < temp2) return true
      if (temp1 > temp2) return false
    }
    return false
  }

}
