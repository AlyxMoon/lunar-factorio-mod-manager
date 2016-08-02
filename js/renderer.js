// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron');

electron.ipcRenderer.on('dataActiveProfile', function(event, message) {
    listActiveProfile(message);
});
electron.ipcRenderer.on('dataAllProfiles', function(event, message) {
    listAllProfiles(message);
});
electron.ipcRenderer.on('dataMods', function(event, message) {
    console.log(message);
    //listMods(message);
});

electron.ipcRenderer.on('ping', function(event, message) {
    console.log(message);
});

$(document).on('dblclick', '.tbl-profile-mod', function(event) {
    event.stopPropagation();
    $(this).toggleClass('danger');

    var data = {};
    // TODO: Improve JQuery selectors
    data['profile'] = $(this).parent().prev().text();
    data['mod'] = $(this).children().first().text();
    data['enabled'] = $(this).children().first().next().text();

    if(data['enabled'] === 'true') {
        data['enabled'] = "false";
        $(this).children().first().next().text('false')
    }
    else {
        data['enabled'] = "true";
        $(this).children().first().next().text('true')
    }

    console.log(data);
    electron.ipcRenderer.send('modToggle', data);

});

$('button').click(function(event) {
    if($(this).text() === "Start Factorio") {
        electron.ipcRenderer.send('startGame');
    }
    else if($(this).text() === "New Profile") {
        console.log("New profile!");
        electron.ipcRenderer.send('newProfile');
    }


});