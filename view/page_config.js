const messager = require('electron').ipcRenderer;
let config;

//---------------------------------------------------------
// Event listeners for client and server events
messager.on('dataAppConfig', function(event, data) {
    console.log(data);
    config = data;
    showAppConfig();
});


//---------------------------------------------------------
//---------------------------------------------------------
$(document).ready(function() {
    messager.send('requestAppConfig');
});

//---------------------------------------------------------
// Helpers and miscellaneous logic

function showAppConfig() {
    let inputMinWidth = $('#input-min-width');
    let inputMinHeight = $('#input-min-height');

    inputMinWidth.val(config.minWidth);
    inputMinHeight.val(config.minHeight);

}