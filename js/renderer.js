// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron');

electron.ipcRenderer.on('data', function(event, message) {
    listProfiles(message);
});

electron.ipcRenderer.on('ping', function(event, message) {
    console.log(message);
});

$(document).on('dblclick', '.tbl-mod', function(event) {
    event.stopPropagation();
    $(this).toggleClass('danger');

    var data = {};
    data['profile'] = $(this).prevAll(".tbl-profile:first").text();
    data['mod'] = $(this).children().first().text();
    // TODO: Get better JQuery selector than this
    data['enabled'] = $(this).children().first().next().text();

    if(data['enabled'] === 'true') {
        data['enabled'] = false;
        $(this).children().first().next().text('false')
    }
    else {
        data['enabled'] = true;
        $(this).children().first().next().text('true')
    }

    console.log(data);
    electron.ipcRenderer.send('modToggle', data);

});