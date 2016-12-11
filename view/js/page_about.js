const messager = require('electron').ipcRenderer;
const shell = require('electron').shell;
//---------------------------------------------------------
// Event listeners for client and server events
messager.on('dataAppVersionInfo', function(event, version, latestVersion, latestVersionLink) {
    showAppVersion(version, latestVersion, latestVersionLink);
});

$(document).on('click', 'a', function(event) {
    event.preventDefault();
    let link = $(this).attr('href');
    shell.openExternal(link);
});
//---------------------------------------------------------
//---------------------------------------------------------
$(document).ready(function() {
    messager.send('requestAppVersionInfo');
});

function showAppVersion(version, latestVersion, latestVersionLink) {
    let element = $('#app-version');

    if(latestVersion && isVersionHigher(version, latestVersion)) {
        element.html(`${version} -- Latest: ${latestVersion} (<a href="${latestVersionLink}">View it here</a>)`);
    }
    else {
        element.text(`${version} -- Up to date`);
    }

}

//---------------------------------------------------------
// Helpers and miscellaneous logic

function isVersionHigher(currentVersion, checkedVersion) {
    // Expecting version to be the following format: major.minor.patch
    let version1 = currentVersion.split('.');
    let version2 = checkedVersion.split('.');

    for(i = 0; i < 3; i++) {
        let temp1 = parseInt(version1[i]), temp2 = parseInt(version2[i]);
        if(temp1 < temp2) return true;
        else if(temp1 > temp2) return false;
    }

    // Would be the same version at this point
    return false;
}