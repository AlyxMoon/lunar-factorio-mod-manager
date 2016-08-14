const electron = require('electron');

//---------------------------------------------------------
// Event listeners for client and server events

electron.ipcRenderer.on('ping', function(event, message) {
    console.log(message);
});
electron.ipcRenderer.on('dataOnlineMods', listOnlineMods);
electron.ipcRenderer.on('dataOnlineModInfo', showOnlineModInfo);

// Uses this way to assign events to elements as they will be dynamically generated
$(document).on('click', '.tbl-onlineMod', requestOnlineModInfo);
$(document).on('click', '.download-mod', requestDownload);


//---------------------------------------------------------
//---------------------------------------------------------
$(document).ready(function() {

});


// Used as callback function
// One argument, an array of strings, representing the names of online mods
function listOnlineMods(event, mods) {
    console.log(mods);
    let table = $('table#primary-table');
    table.children().remove();

    table.append('<thead><tr id="primary-table-name" class="bg-primary"><th colspan="2">All Online Mods</th></tr></thead>');
    table.append('<tbody>');

    for(let i = 0; i < mods.length; i++) {
        table.append('<tr class="tbl-onlineMod"><td>' + mods[i]['name'] + '</td></tr>');
    }
    table.append('</tbody>');
}

// Will return the info pulled from the info.json file of the selected mod
function requestOnlineModInfo() {
    $('.tbl-onlineMod').removeClass('info');
    $(this).addClass('info');

    electron.ipcRenderer.send('requestOnlineModInfo', $(this).text());

}
function showOnlineModInfo(event, mod) {
    console.log(mod);
    let modInfo = mod['latest_release']['info_json'];
    console.log(modInfo);

    let table = $('table#tbl-mod-info');
    table.children().remove();

    table.append(`<thead><tr class="bg-info"><th class="selected-mod" colspan="2">${mod['title']}</th></tr></thead>`);
    table.append('<tbody>');
    let tableBody = $('table#tbl-mod-info tbody');

    if(mod['latest_release']['download_url']) {
        tableBody.append(`<tr><th id="${mod['id']}" class="center download-mod" colspan="2"><a href="#">Download Mod</a></th></tr>`);
    }

    if(modInfo['version']) {
        tableBody.append(`<tr><td>Version</td><td>${modInfo['version']}</td></tr>`);
    }
    else {
        tableBody.append(`<tr><td>Version</td><td>Not found</td></tr>`);
    }

    if(modInfo['author']) {
        tableBody.append(`<tr><td>Author</td><td>${modInfo['author']}</td></tr>`);
    }
    else {
        tableBody.append(`<tr><td>Author</td><td>Not found</td></tr>`);
    }

    if(modInfo['contact']) {
        tableBody.append(`<tr><td>Contact</td><td>${modInfo['contact']}</td></tr>`);
    }
    else {
        tableBody.append(`<tr><td>Contact</td><td>Not included</td></tr>`);
    }
    if(modInfo['homepage']) {
        tableBody.append(`<tr><td>Homepage</td><td>${modInfo['homepage']}</td></tr>`);
    }
    else {
        tableBody.append(`<tr><td>Homepage</td><td>Not included</td></tr>`);
    }

    if(modInfo['factorio_version']) {
        tableBody.append(`<tr><td>Factorio Version</td><td>${modInfo['factorio_version']}</td></tr>`);
    }
    else {
        tableBody.append(`<tr><td>Factorio Version</td><td>Not found</td></tr>`);
    }

    if(modInfo['dependencies'] && modInfo['dependencies'].length > 0) {
        let dependencies = modInfo['dependencies'];
        tableBody.append(`<tr><td>Dependencies</td><td>${dependencies[0]}</td></tr>`);
        for(let i = 1; i < dependencies.length; i++) {
            tableBody.append(`<tr><td></td><td>${dependencies[i]}</td></tr>`);
        }
    }
    else {
        tableBody.append(`<tr><td>Dependencies</td><td>None specified</td></tr>`);
    }

    tableBody.append(`<tr><th class="center" colspan="2">Mod Description</th></tr>`);
    if(modInfo['description']) {
        tableBody.append(`<tr><td class="center" colspan="2">${modInfo['description']}</td></tr>`);
    }
    else {
        tableBody.append(`<tr><td class="center" colspan="2">No description found</td></tr>`);
    }

    tableBody.append('</tbody>');

}

function requestDownload(event) {
    let requestedMod = $(this).attr('id');
    electron.ipcRenderer.send('requestDownload', requestedMod);
}
