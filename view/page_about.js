const messager = require('electron').ipcRenderer;
const shell = require('electron').shell;
//---------------------------------------------------------
// Event listeners for client and server events
messager.on('dataAppVersion', function(event, version, latestVersion) {
    showAppVersion(version, latestVersion);
});

$('a').click( function(event) {
    event.preventDefault();
    let link = $(this).attr('href');
    shell.openExternal(link);
});
//---------------------------------------------------------
//---------------------------------------------------------
$(document).ready(function() {
    messager.send('requestAppVersion');
});

function showAppVersion(version, latestVersion) {
    $('#app-version').text(version);
    if(latestVersion !== undefined) {
        // TODO: Version checking
    }

}