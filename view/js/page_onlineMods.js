const messager = require('electron').ipcRenderer;
const helpers = require(`${__dirname}/../../lib/helpers.js`);

let factorioVersion;
let installedMods;
let onlineMods;
let canDownloadMods = false;

let selectedMod;
let sortingOption = 'alpha-asc';
let filterOption = 'all';
let tags;

//---------------------------------------------------------
// Event listeners for client and server events

messager.on('dataFactorioVersion', function(event, version) {
    factorioVersion = version;
});

messager.on('dataPlayerInfo', function(event, username) {
    if(username !== '') canDownloadMods = true;
});

messager.on('dataInstalledMods', function(event, mods) {
    installedMods = mods;
});
messager.on('dataOnlineMods', function(event, mods) {
    onlineMods = mods;
    getUsedTags(onlineMods); // Having this in event 'dataModFetchStatus' was not working properly.
    listOnlineMods();
});

// Some things should be run only after all mods are fetched, to save cycles
messager.on('dataModFetchStatus', function(event, loaded) {
    if(loaded) {
        // I'd like to have the list be updated as mods load in, but we need to optimize updating the list
        // As it stands, if we call this every interval it'll bring the app to a crawl
        messager.send('requestOnlineMods');
    }
});

messager.on('dataOnlineModInfo', showOnlineModInfo);

// Uses this way to assign events to elements as they will be dynamically generated
$(document).on('click', 'table#mods-list tbody td.modName', showOnlineModInfo);
$(document).on('click', '.download-mod', requestDownload);

$('a.sort-mods').click(function() {
    sortingOption = $(this).attr('id');
    listOnlineMods();
});
$(document).on('click', 'a.filter-mods', function() {
    filterOption = $(this).attr('id');
    listOnlineMods();
});

// Make sure changing dropdown updates the view if the user is browsing the same mod
$(document).on('change', 'select', function() {
    let modID = Number($(this).parent().next().attr('id'));
    if(selectedMod && modID === selectedMod.id) {
        $(`#${modID}`).trigger('click');
    }
});

//---------------------------------------------------------
//---------------------------------------------------------
$(document).ready(function() {
    messager.send('requestFactorioVersion');
    messager.send('requestPlayerInfo');
    messager.send('requestInstalledMods');
    messager.send('requestModFetchStatus');
    messager.send('requestOnlineMods');
});

// Used as callback function
// One argument, an array of strings, representing the names of online mods
function listOnlineMods() {
    let mods = sortMods(onlineMods.slice());
    mods = filterMods(mods);

    let table = $('table#mods-list');
    table.children().remove();

    table.append(`<thead><tr class="bg-primary"><th colspan="2">Online Mods: ${filterOption}</th></tr></thead>`);
    table.append('<tbody>');

    for(let i = 0; i < mods.length; i++) {
        let dropdownMenu = '<select>';
        let releases = getModReleases(mods[i]);
        for(let j = 0; j < releases.length; j++) {
            dropdownMenu += `<option value='${j}'>${releases[j]}</option>`;
        }
        dropdownMenu += '</select>';

        table.append(`<tr><td class="modReleases">${dropdownMenu}</td><td class="modName" id="${mods[i]['id']}">${mods[i]['name']}</td></tr>`);
        if(isModDownloaded(mods[i]['name'])) {
            $('table#mods-list tbody td').last().addClass('downloaded');
            if(hasUpdate(mods[i])) {
                $('table#mods-list tbody td').last().addClass('hasUpdate');
                $('table#mods-list tbody td').last().prepend('<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> ');
            }
            else {
                $('table#mods-list tbody td').last().prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> ');
            }

        }


    }
    table.append('</tbody>');
}

function showOnlineModInfo() {
    $('table#mods-list tbody tr').removeClass('info');
    $(this).parent().addClass('info');

    let modID = $(this).attr('id')
    let mod;
    for(let i = onlineMods.length - 1; i >= 0; i--) {
       if(onlineMods[i]['id'] == modID) {
           mod = onlineMods[i];
           selectedMod = onlineMods[i];
           break;
       }
    }
    let release = Number($(this).prev().children().val());

    let modInfo = mod.releases[release].info_json;

    let table = $('table#mod-info');
    table.children().remove();

    table.append(`<thead><tr class="bg-info"><th class="selected-mod" colspan="2">${mod['title']}</th></tr></thead>`);
    table.append('<tbody>');
    let tableBody = $('table#mod-info tbody');

    if(!canDownloadMods) {
        tableBody.append(`<tr><th colspan="2">Cannot Download Mods</th></tr>`);
    }
    else if(isModDownloaded(mod.name)) {
        tableBody.append(`<tr><th colspan="2">Get updates from the 'Installed Mods' page</th></tr>`);
    }
    else {
        if(mod.releases[release].download_url) {
            tableBody.append(`<tr><th data-id="${mod.id}" data-url="${mod.releases[release].download_url}" class="center download-mod" colspan="2"><a href="#">Download Mod</a></th></tr>`);
        }
    }


    if(modInfo['version']) {
        tableBody.append(`<tr><td>Version</td><td>${modInfo['version']}</td></tr>`);
    }
    else {
        tableBody.append(`<tr><td>Version</td><td>Not found</td></tr>`);
    }

    if(mod['owner']) {
        tableBody.append(`<tr><td>Owner</td><td>${mod['owner']}</td></tr>`);
    }
    else {
        tableBody.append(`<tr><td>Owner</td><td>Not found</td></tr>`);
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
    if(mod['downloads_count']) {
        tableBody.append(`<tr><td>Downloads</td><td>${mod['downloads_count']}</td></tr>`);
    }
    else {
        tableBody.append(`<tr><td>Downloads</td><td>Not found</td></tr>`);
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
    let id = $(this).data('id');
    let url = $(this).data('url');
    messager.send('requestDownload', id, url);
}

function showFiltersTags() {
    let filterMenu = $("#filter-menu");
    filterMenu.children().remove();

    filterMenu.append('<li class="dropdown-header">Tags</li>');
    filterMenu.append(`<li><a id="all" class="filter-mods" href="#">All</a></li>`);
    for(let i = 0; i < tags.length; i++) {
        filterMenu.append(`<li><a id="${tags[i].name}" class="filter-mods" href="#">${tags[i].title}</a></li>`);
    }

}

//---------------------------------------------------------
// Logic and helper functions

function getModReleases(mod) {
    let releases = [];
    mod.releases.forEach((elem) => {
        releases.push(elem.version);
    });

    return releases;
}

function isModDownloaded(modName) {
    let length = installedMods.length;
    for(let i = 0; i < length; i++) {
        if(installedMods[i].name === modName) return true;
    }
    return false;
}

function hasUpdate(mod) {
    let length = installedMods.length;
    for(let i = 0; i < length; i++) {
        if(installedMods[i].name === mod.name) {
            for(let j = 0; j < mod.releases.length; j++) {
                if(mod.releases[j].factorio_version === factorioVersion &&
                isVersionHigher(installedMods[i].version, mod.releases[j].version) ) {
                    return true;
                }

            }
            return false;
        }
    }
    return false;
}

function isVersionHigher(currentVersion, checkedVersion) {
    // Expecting version to be the following format: major.minor.patch
    let version1 = currentVersion.split('.');
    let version2 = checkedVersion.split('.');

    for(i = 0; i < 3; i++) {
        let temp1 = parseInt(version1[i]), temp2 = parseInt(version2[i]);
        if(temp1 < temp2) return true;
        else if(temp1 > temp2) return false;
    }

    // Would be the same version at this point
    return false;
}

function getUsedTags(mods) {
    tags = [];

    for(let i = mods.length - 1; i >= 0; i--) {
        for(let j = mods[i].tags.length - 1; j >= 0; j--) {
            tags.push(mods[i].tags[j]);
        }
    }

    tags = helpers.sortArrayByProp(tags, 'id');
    tags.reverse();
    for(let i = 1; i < tags.length;) {
        if(tags[i - 1].id == tags[i].id) tags.splice(i, 1);
        else i++;
    }
    showFiltersTags();
}

function sortMods(mods) {

    switch(sortingOption) {
        case 'alpha-asc':
            mods = helpers.sortArrayByProp(mods, 'name');
            break;
        case 'alpha-desc':
            mods = helpers.sortArrayByProp(mods, 'name');
            mods.reverse();
            break;
        case 'author-asc':
            mods = helpers.sortArrayByProp(mods, 'owner');
            break;
        case 'author-desc':
            mods = helpers.sortArrayByProp(mods, 'owner');
            mods.reverse();
            break;
        case 'download-asc':
            mods = helpers.sortArrayByProp(mods, 'downloads_count');
            break;
        case 'download-desc':
            mods = helpers.sortArrayByProp(mods, 'downloads_count');
            mods.reverse();
            break;
        case 'update-asc':
            mods = helpers.sortModsByRecentUpdate(mods);
            break;
        case 'update-desc':
            mods = helpers.sortModsByRecentUpdate(mods);
            mods.reverse();
            break;
        default:
            console.log('Sort option not set up -- ', sortingOption);
    }
    return mods;
}

function filterMods(mods) {
    if(filterOption !== 'all') {
        for(let i = 0; i < mods.length;) {
            let containsTag = false;
            for(let j = 0; j < mods[i].tags.length; j++) {
                if(mods[i].tags[j].name === filterOption) {
                    containsTag = true;
                    break;
                }
            }
            if(!containsTag) mods.splice(i, 1);
            else i++;
        }
    }
    return mods;
}

