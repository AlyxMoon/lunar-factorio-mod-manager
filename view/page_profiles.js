const electron = require('electron');

//---------------------------------------------------------
// Event listeners for client and server events

electron.ipcRenderer.on('dataActiveProfile', listActiveProfile);
electron.ipcRenderer.on('dataAllProfiles', listAllProfiles);

// Uses this way to assign events to elements as they will be dynamically generated
$(document).on('click', '.tbl-mod', toggleMod);
$(document).on('click', '.tbl-profile', activateProfile);

$('button#profile-new').click(profileNew);
$('button#profile-rename').click(profileRename);
$('button#profile-delete').click(profileDelete);
$('button#profile-sort-up').click(profileSortUp);
$('button#profile-sort-down').click(profileSortDown);
$('button').click(function() { $(this).blur() });

//---------------------------------------------------------
//---------------------------------------------------------
$(document).ready(function() {

});

// Used as callback function
// One argument, an array of a single object containing:
//      The Factorio mod list with key "mods", a bool with key "enabled", and a string with key "name"
function listActiveProfile(event, profile) {

    console.log(profile);
    let table = $('table#primary-table');
    table.children().remove();

    table.append('<thead><tr id="primary-table-name" class="bg-info"><th colspan="2">' + profile['name'] + '</th></tr></thead>');
    table.append('<tbody>');

    let numMods = profile['mods'].length;
    for(let i = 0; i < numMods; i++) {
        mod = profile['mods'][i];
        table.append('<tr class="tbl-mod"><td>' + mod['name'] + '</td><td>' + mod['enabled'] + '</td></tr>');

        if(mod['enabled'] === 'false') {
            $('table#primary-table tbody tr').last().addClass('danger');
        }
    }
    table.append('</tbody>');
}

// Used as callback function
// One argument, an array of a objects, each containing:
//      The Factorio mod list with key "mods", a bool with key "enabled", and a string with key "name"
function listAllProfiles(event, profiles) {
    console.log(profiles);
    let tableBody = $('table#all-profiles tbody');
    tableBody.children().remove();

    for(let i = 0; i < profiles.length; i++) {
        tableBody.append('<tr class="tbl-profile"><td>' + profiles[i]['name'] + '</td></tr>');

        if(profiles[i]['enabled']) {
            $('table#all-profiles tbody tr').last().addClass('info');
        }
    }
}

// Used as callback function
// Takes no extra arguments
function toggleMod(event) {
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
}

// Used as callback function
// Takes no extra arguments
function activateProfile(event) {
    event.stopPropagation();
    console.log($(this).text());
    electron.ipcRenderer.send('activateProfile', $(this).text());

}

//---------------------------------------------------------
// Button listeners for profile management

function profileNew() {
    electron.ipcRenderer.send('newProfile');
}
function profileRename() {
    let tableHead = $('table#primary-table thead');
    let profileName = tableHead.children().text();

    tableHead.children().remove();
    tableHead.append('<tr class="info"><th><textarea rows="1">' + profileName + '</textarea></th></tr>');
    $('table#primary-table thead tr').append('<th><button id="rename-submit" type="button" class="btn btn-default">Save Name</button></th>');

    $('#rename-submit').on('click', function() { electron.ipcRenderer.send('renameProfile', $('textarea').val()) });
    $('textarea').focus().select();
}
function profileDelete() {
    electron.ipcRenderer.send('deleteProfile');
}
function profileSortUp() {
    electron.ipcRenderer.send('sortProfile', 'up');
}
function profileSortDown() {
    electron.ipcRenderer.send('sortProfile', 'down');
}

//---------------------------------------------------------
//---------------------------------------------------------