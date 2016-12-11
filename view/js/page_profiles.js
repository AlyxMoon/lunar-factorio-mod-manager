const messager = require('electron').ipcRenderer;

//---------------------------------------------------------
// Event listeners for client and server events

messager.on('dataActiveProfile', listActiveProfile);
messager.on('dataAllProfiles', listAllProfiles);

// Uses this way to assign events to elements as they will be dynamically generated
$(document).on('click', 'table#profiles-list td', activateProfile);
$(document).on('change', '.checkbox', function() {
    toggleMod(this.checked, $(this).data('index'));
});

$('button#profile-new').click(profileNew);
$('button#profile-rename').click(profileRename);
$('button#profile-delete').click(profileDelete);
$('button#profile-sort-up').click(profileSortUp);
$('button#profile-sort-down').click(profileSortDown);
$('button').click(function() { $(this).blur() });

//---------------------------------------------------------
//---------------------------------------------------------
$(document).ready(function() {
    messager.send('requestAllProfiles');
    messager.send('requestActiveProfile');
});

// Used as callback function
// One argument, an array of a single object containing:
//      The Factorio mod list with key "mods", a bool with key "enabled", and a string with key "name"
function listActiveProfile(event, profile) {
    console.log(profile);
    let table = $('table#active-profile');
    table.children().remove();

    table.append(`<thead><tr class="bg-info"><th colspan="2">${profile.name}</th></tr></thead>`);
    table.append('<tbody>');

    let numMods = profile['mods'].length;
    for(let i = 0; i < numMods; i++) {
        mod = profile.mods[i];
        if(mod.enabled === "true") {
            table.append(`<tr><td><input class="checkbox" type="checkbox" data-index="${i}" checked="checked"</input></td><td>${mod.name}</td></tr>`);
        }
        else {
            table.append(`<tr><td><input class="checkbox" type="checkbox" data-index="${i}"</input></td><td>${mod.name}</td></tr>`);
            $('table#active-profile tbody tr').last().addClass('danger');
        }
    }
    table.append('</tbody>');
}

// Used as callback function
// One argument, an array of a objects, each containing:
//      The Factorio mod list with key "mods", a bool with key "enabled", and a string with key "name"
function listAllProfiles(event, profiles) {
    console.log(profiles);
    let tableBody = $('table#profiles-list tbody');
    tableBody.children().remove();

    for(let i = 0; i < profiles.length; i++) {
        tableBody.append('<tr><td>' + profiles[i]['name'] + '</td></tr>');

        if(profiles[i]['enabled']) {
            $('table#profiles-list tbody tr').last().addClass('info');
        }
    }
}

// Used as callback function
// Takes no extra arguments
function toggleMod(checked, index) {
    let selectedRow = $('table#active-profile tbody tr').eq(index);
    selectedRow.toggleClass('danger');
    messager.send('toggleMod', selectedRow.children().eq(1).text());
}

// Used as callback function
// Takes no extra arguments
function activateProfile(event) {
    event.stopPropagation();
    messager.send('activateProfile', $(this).text());
}

//---------------------------------------------------------
// Button listeners for profile management

function profileNew() {
    messager.send('newProfile');
}
function profileRename() {
    let tableHead = $('table#active-profile thead');
    let profileName = tableHead.children().text();

    tableHead.children().remove();
    tableHead.append('<tr class="info"><th><textarea rows="1">' + profileName + '</textarea></th></tr>');
    $('table#active-profile thead tr').append('<th><button id="rename-submit" type="button" class="btn btn-default">Save Name</button></th>');

    $('#rename-submit').on('click', function() { messager.send('renameProfile', $('textarea').val()) });
    $('textarea').focus().select();
}
function profileDelete() {
    messager.send('deleteProfile');
}
function profileSortUp() {
    messager.send('sortProfile', 'up');
}
function profileSortDown() {
    messager.send('sortProfile', 'down');
}

//---------------------------------------------------------
//---------------------------------------------------------