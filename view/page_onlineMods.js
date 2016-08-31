const messager = require('electron').ipcRenderer;

let installedMods;
let onlineMods;
let canDownloadMods = false;

//---------------------------------------------------------
// Event listeners for client and server events
messager.on('dataPlayerInfo', function(event, username) {
    if(username !== '') canDownloadMods = true;
});

messager.on('dataInstalledMods', function(event, mods) {
    installedMods = mods;
});
messager.on('dataOnlineMods', listOnlineMods);
messager.on('dataOnlineModInfo', showOnlineModInfo);

// Uses this way to assign events to elements as they will be dynamically generated
$(document).on('click', 'table#mods-list tbody td', showOnlineModInfo);
$(document).on('click', '.download-mod', requestDownload);

//---------------------------------------------------------
//---------------------------------------------------------
$(document).ready(function() {
    messager.send('requestPlayerInfo');
    messager.send('requestInstalledMods');
    messager.send('requestOnlineMods');
});

// Used as callback function
// One argument, an array of strings, representing the names of online mods
function listOnlineMods(event, mods) {
    onlineMods = mods;

    let table = $('table#mods-list');
    table.children().remove();

    table.append('<thead><tr class="bg-primary"><th colspan="2">All Online Mods</th></tr></thead>');
    table.append('<tbody>');

    for(let i = 0; i < mods.length; i++) {
        table.append(`<tr><td id="${mods[i]['id']}">` + mods[i]['name'] + '</td></tr>');
        if(isModDownloaded(mods[i]['name'])) {
            $('table#mods-list tbody td').last().addClass('downloaded');
            $('table#mods-list tbody td').last().prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>   ');
        }

    }
    table.append('</tbody>');
}

function showOnlineModInfo() {
    $('table#mods-list tbody td').removeClass('info');
    $(this).addClass('info');

    let modID = $(this).attr('id')
    let mod;
    for(let i = onlineMods.length - 1; i >= 0; i--) {
       if(onlineMods[i]['id'] == modID) {
           mod = onlineMods[i];
           break;
       }
    }

    let modInfo = mod['latest_release']['info_json'];

    let table = $('table#mod-info');
    table.children().remove();

    table.append(`<thead><tr class="bg-info"><th class="selected-mod" colspan="2">${mod['title']}</th></tr></thead>`);
    table.append('<tbody>');
    let tableBody = $('table#mod-info tbody');

    if($(this).hasClass('downloaded')) {
        tableBody.append(`<tr><th colspan="2">Already Downloaded Mod</th></tr>`);
    }
    else if(!canDownloadMods) {
        tableBody.append(`<tr><th colspan="2">Cannot Download Mods</th></tr>`);
    }
    else {
        if(mod['latest_release']['download_url']) {
            tableBody.append(`<tr><th id="${mod['id']}" class="center download-mod" colspan="2"><a href="#">Download Mod</a></th></tr>`);
        }
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
    messager.send('requestDownload', requestedMod);
}

//---------------------------------------------------------
// Logic and helper functions
function isModDownloaded(modName) {
    let length = installedMods.length;
    for(let i = 0; i < length; i++) {
        if(installedMods[i] === modName) return true;
    }
    return false;
}