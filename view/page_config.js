const messager = require('electron').ipcRenderer;
let config;

//---------------------------------------------------------
// Event listeners for client and server events
messager.on('dataAppConfig', function(event, data) {
    config = data;
    showAppConfig();
});

$('input').focusout(function() {

});

//---------------------------------------------------------
//---------------------------------------------------------
$(document).ready(function() {
    messager.send('requestAppConfig');
});

//---------------------------------------------------------
// Helpers and miscellaneous logic

function showAppConfig() {


}