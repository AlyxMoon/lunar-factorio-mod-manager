// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron');

electron.ipcRenderer.on('ping', function(event, message) {
    console.log(message);
});
electron.ipcRenderer.on('dataActiveProfile', listActiveProfile);
electron.ipcRenderer.on('dataAllProfiles', listAllProfiles);
electron.ipcRenderer.on('dataInstalledMods', listInstalledMods);
electron.ipcRenderer.on('dataModInfo', showModInfo);

$(document).on('click', '.tbl-mod', toggleMod);
$(document).on('click', '.tbl-installedMod', requestModInfo);
$(document).on('click', '.tbl-profile', activateProfile);
$('button').click(handleButtons);

$(document).ready(function() {

    let activeProfileTable = $('table#active-profile');
    let allProfilesTable = $('table#all-profiles');

    activeProfileTable.css('max-height', activeProfileTable.parent().height());
    allProfilesTable.css('max-height', allProfilesTable.parent().height());

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
// One argument, an array of strings, representing the names of mods installed:
function listInstalledMods(event, mods) {
    console.log(mods);
    let table = $('table#primary-table');
    table.children().remove();

    table.append('<thead><tr id="primary-table-name" class="bg-primary"><th colspan="2">All Installed Mods</th></tr></thead>');
    table.append('<tbody>');

    for(let i = 0; i < mods.length; i++) {
        table.append('<tr class="tbl-installedMod"><td>' + mods[i] + '</td></tr>');
    }
    table.append('</tbody>');

}

// Will return the info pulled from the info.json file of the selected mod
function requestModInfo() {
    $('.tbl-installedMod').removeClass('info');
    $(this).addClass('info');

    electron.ipcRenderer.send('requestModInfo', $(this).text());

}
function showModInfo(event, mod) {
    console.log(mod);

    let table = $('table#tbl-mod-info');
    table.children().remove();

    table.append(`<thead><tr class="bg-info"><th colspan="2">${mod['title']}</th></tr></thead>`);
    table.append('<tbody>');
    let tableBody = $('table#tbl-mod-info tbody');

    if(mod['version']) {
        tableBody.append(`<tr><td>Version</td><td>${mod['version']}</td></tr>`);
    }
    else {
        tableBody.append(`<tr><td>Version</td><td>Not found</td></tr>`);
    }

    if(mod['author']) {
        tableBody.append(`<tr><td>Author</td><td>${mod['author']}</td></tr>`);
    }
    else {
        tableBody.append(`<tr><td>Author</td><td>Not found</td></tr>`);
    }

    if(mod['contact']) {
        tableBody.append(`<tr><td>Contact</td><td>${mod['contact']}</td></tr>`);
    }
    else {
        tableBody.append(`<tr><td>Contact</td><td>Not included</td></tr>`);
    }
    if(mod['homepage']) {
        tableBody.append(`<tr><td>Homepage</td><td>${mod['homepage']}</td></tr>`);
    }
    else {
        tableBody.append(`<tr><td>Homepage</td><td>Not included</td></tr>`);
    }

    if(mod['factorio_version']) {
        tableBody.append(`<tr><td>Factorio Version</td><td>${mod['factorio_version']}</td></tr>`);
    }
    else {
        tableBody.append(`<tr><td>Factorio Version</td><td>Not found</td></tr>`);
    }

    if(mod['dependencies'] && mod['dependencies'].length > 0) {
        let dependencies = mod['dependencies'];
        tableBody.append(`<tr><td>Dependencies</td><td>${dependencies[0]}</td></tr>`);
        for(let i = 1; i < dependencies.length; i++) {
            tableBody.append(`<tr><td></td><td>${dependencies[i]}</td></tr>`);
        }
    }
    else {
        tableBody.append(`<tr><td>Dependencies</td><td>None specified</td></tr>`);
    }

    tableBody.append(`<tr><th class="center" colspan="2">Mod Description</th></tr>`);
    if(mod['description']) {
        tableBody.append(`<tr><td class="center" colspan="2">${mod['description']}</td></tr>`);
    }
    else {
        tableBody.append(`<tr><td class="center" colspan="2">No description found</td></tr>`);
    }

    tableBody.append('</tbody>');

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

// Used as callback function
// Takes no extra arguments
function renameProfile(event) {
    electron.ipcRenderer.send('renameProfile', $('textarea').val());
}

// Used as callback function
// Takes no extra arguments
function handleButtons(event) {
    if($(this).text() === 'Start Factorio') {
        electron.ipcRenderer.send('startGame');
    }
    else if($(this).text() === 'New Profile') {
        electron.ipcRenderer.send('newProfile');
    }
    else if($(this).text() === 'Rename Profile') {
        startRename();
    }
    else if($(this).text() === 'Delete Profile') {
        electron.ipcRenderer.send('deleteProfile');
    }
    else if($(this).attr('id') === 'profile-up') {
        electron.ipcRenderer.send('sortProfile', 'up');
    }
    else if($(this).attr('id') === 'profile-down') {
        electron.ipcRenderer.send('sortProfile', 'down');
    }

    else if($(this).attr('id') === 'page_profiles') {
        electron.ipcRenderer.send('changePage', $(this).attr('id'));
    }
    else if($(this).attr('id') === 'page_localMods') {
        electron.ipcRenderer.send('changePage', $(this).attr('id'));
    }
    else if($(this).attr('id') === 'page_onlineMods') {
        electron.ipcRenderer.send('changePage', $(this).attr('id'));
    }

    $(this).blur();
}


function startRename() {
    let tableHead = $('table#primary-table thead');
    let profileName = tableHead.children().text();
    tableHead.children().remove();
    tableHead.append('<tr class="info"><th><textarea rows="1">' + profileName + '</textarea></th></tr>');
    $('table#primary-table thead tr').append('<th><button id="rename-submit" type="button" class="btn btn-default">Save Name</button></th>');
    $('#rename-submit').on('click', renameProfile);
    $('textarea').focus().select();
}