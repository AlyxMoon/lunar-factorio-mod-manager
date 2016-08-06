// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron');

$(document).ready(function() {


});

/* The input 'profiles' needs to look like this:
 [
 {
 'mods': [
 {
 'name': 'Factorio Mod Name'
 'enabled': 'true' or 'false'
 }
 ]
 'name': 'Name of Profile'
 }
 ]
 */

function listActiveProfile(profile) {

    console.log(profile);
    let table = $('table#active-profile');
    table.css('max-height', table.parent().height());
    table.children().remove();

    table.append('<thead><tr id="active-profile-name" class="info"><th colspan="2">' + profile['name'] + '</th></tr></thead>');
    table.append('<tbody>');

    numMods = profile['mods'].length;
    for(let i = 0; i < numMods; i++) {
        mod = profile['mods'][i];
        table.append('<tr class="tbl-mod"><td>' + mod['name'] + '</td><td>' + mod['enabled'] + '</td></tr>');

        if(mod['enabled'] === 'false') {
            $('table#active-profile tbody tr').last().addClass('danger');
        }
    }
    table.append('</tbody>');
}

function listAllProfiles(profiles) {
    console.log(profiles);
    let table = $('table#all-profiles');
    table.css('max-height', table.parent().height());
    table.children().remove();

    table.append('<thead><tr><th>Profiles:</th></tr></thead>');
    table.append('<tbody>');

    for(let i = 0; i < profiles.length; i++) {
        table.append('<tr class="tbl-profile"><td>' + profiles[i]['name'] + '</td></tr>');

        if(profiles[i]['enabled']) {
            $('table#all-profiles tbody tr').last().addClass('info');
        }
    }
    table.append('</tbody>');

}

function listMods(mods) {
    console.log(mods);
    let table = $('#mods-table');
    table.css('height', table.parent().height());
    table.append('<tbody>');

    for(let i = 0; i < mods.length; i++) {
        table.append('<tr class="tbl-profile"><td>' + mods[i] + '</td></tr>');
    }
    table.append('</tbody>');

}

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

$(document).on('click', '.tbl-mod', function(event) {
    event.stopPropagation();
    $(this).toggleClass('danger');

    let data = {};
    data['profile'] = $(this).parent().prev().text();
    data['mod'] = $(this).children().first().text();
    data['enabled'] = $(this).children().first().next().text();

    if(data['enabled'] === 'true') {
        data['enabled'] = 'false';
        $(this).children().first().next().text('false')
    }
    else {
        data['enabled'] = 'true';
        $(this).children().first().next().text('true')
    }

    console.log(data);
    electron.ipcRenderer.send('toggleMod', data);

});

$(document).on('click', '.tbl-profile', function(event) {
    event.stopPropagation();
    console.log($(this).text());
    electron.ipcRenderer.send('activateProfile', $(this).text());


});

$(document).on('click', '#rename-submit', function(event) {
    electron.ipcRenderer.send('renameProfile', $('textarea').val());
});

$('button').click(function(event) {
    if($(this).text() === 'Start Factorio') {
        electron.ipcRenderer.send('startGame');
    }
    else if($(this).text() === 'New Profile') {
        console.log('New profile!');
        electron.ipcRenderer.send('newProfile');
    }
    else if($(this).text() === 'Rename Profile') {
        console.log('Rename profile!');
        startRename();
    }
    else if($(this).text() === 'Delete Profile') {
        console.log('Delete profile!');
        electron.ipcRenderer.send('deleteProfile');
    }
    $(this).blur();

});

function startRename() {
    if($('#active-profile-name').length) {
        let tableHead = $('table#active-profile thead');
        let profileName = tableHead.children().text();
        tableHead.children().remove();
        tableHead.append('<tr class="info"><th><textarea rows="1">' + profileName + '</textarea></th></tr>');
        $('table#active-profile thead tr').append('<th><button id="rename-submit" type="button" class="btn btn-default">Save Name</button></th>');
    }


}