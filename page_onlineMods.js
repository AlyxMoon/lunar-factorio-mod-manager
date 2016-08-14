const electron = require('electron');

electron.ipcRenderer.on('ping', function(event, message) {
    console.log(message);
});

$(document).ready(function() {

});