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

$(document).on('dblclick', '.tbl-mod', function(event) {
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

$(document).on('dblclick', '.tbl-profile', function(event) {
    event.stopPropagation();
    console.log($(this).text());
    electron.ipcRenderer.send('activateProfile', $(this).text());


});

$(document).on('click', '#rename-submit', function(event) {
    electron.ipcRenderer.send('renameProfile', $('textarea').val());
});

$('button').click(function(event) {
    if($(this).text() === "Start Factorio") {
        electron.ipcRenderer.send('startGame');
    }
    else if($(this).text() === "New Profile") {
        console.log("New profile!");
        electron.ipcRenderer.send('newProfile');
    }
    else if($(this).text() === "Rename Profile") {
        console.log("Rename profile!");
        startRename();
    }
    else if($(this).text() === "Delete Profile") {
        console.log("Delete profile!");
        electron.ipcRenderer.send('deleteProfile');
    }

});

function startRename() {
    if($('#active-profile-name').length) {
        let tableHead = $('table#active-profile thead');
        let profileName = tableHead.children().text();
        tableHead.children().remove();
        tableHead.append("<tr class='info'><th><textarea rows='1'>" + profileName + "</textarea></th></tr>");
        $('table#active-profile thead tr').append('<th><button id="rename-submit" type="button" class="btn btn-default">Save Name</button></th>');
    }


}