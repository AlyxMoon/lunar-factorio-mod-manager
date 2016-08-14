const electron = require('electron');

//---------------------------------------------------------
// Event listeners for client and server events

electron.ipcRenderer.on('ping', function(event, message) {
    console.log(message);
});
electron.ipcRenderer.on('dataInstalledMods', listInstalledMods);
electron.ipcRenderer.on('dataInstalledModInfo', showInstalledModInfo);

// Uses this way to assign events to elements as they will be dynamically generated
$(document).on('click', '.tbl-installedMod', requestInstalledModInfo);

$('button').click(handleButtons);

//---------------------------------------------------------
//---------------------------------------------------------
$(document).ready(function() {

});

// Used as callback function
// One argument, an array of strings, representing the names of mods installed
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
function requestInstalledModInfo() {
    $('.tbl-installedMod').removeClass('info');
    $(this).addClass('info');

    electron.ipcRenderer.send('requestInstalledModInfo', $(this).text());

}
function showInstalledModInfo(event, mod) {
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
function handleButtons(event) {
    if($(this).text() === 'Start Factorio') {
        electron.ipcRenderer.send('startGame');
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