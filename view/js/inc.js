const messager = require('electron').ipcRenderer;
const shell = require('electron').shell;

let allProfiles;
let activeProfile;

let installedMods;
let onlineMods;
let selectedMod;
let factorioVersion;

//---------------------------------------------------------
//---------------------------------------------------------
// Event listeners for client and server events
messager.on('ping', function(event, message) {
    console.log(message);
});

messager.on('dataModFetchStatus', function(event, loaded, page, pageCount) {
    if(!loaded) {
        window.setTimeout(() => {
            messager.send('requestModFetchStatus');
        }, 1000);
    }
    else {
        messager.once('dataOnlineMods', function(event, mods) {
            onlineMods = mods;
            checkModVersions();
        });
        messager.send('requestOnlineMods');
    }
    showLoadingStatus(loaded, page, pageCount);
});

messager.on('dataPlayerInfo', function(event, username) {
    showPlayerInfo(username);
});

messager.on('dataModDownloadStatus', function(event, status, modName) {
    showModDownloadStatus(status, modName);
});

messager.on('dataAppVersionInfo', function(event, version, latestVersion, latestVersionLink) {
    showAppVersion(version, latestVersion, latestVersionLink);
});

messager.on('dataActiveProfile', function(event, profile) {
    activeProfile = profile;
    listActiveProfile()
});

messager.on('dataAllProfiles', function(event, profiles) {
    allProfiles = profiles;
    listAllProfiles()
});

messager.on('dataInstalledMods', function(event, mods) {
    installedMods = mods;
    listInstalledMods();
    if(onlineMods) checkModVersions();
});

messager.on('dataFactorioVersion', function(event, version) {
    factorioVersion = version;
});

//------------------------------
// Related to header
$('button#start-factorio').click(function() {
    messager.send('startGame');
});

$('button.changeView').click(function() {
    let view = $(this).data('view');
    changeView(view);
});

//------------------------------
// Related to footer


//------------------------------
// Related to profiles
$('table#active-profile').on('change', '.checkbox', function() {
    toggleMod(this.checked, $(this).data('index'));
});

$('table#profiles-list').on('click', '.select-profile', function() {
    console.log($(this).data('index'));
    activateProfile($(this).data('index'));
});

$('table#profiles-list').on('click', '.sort-profile', function() {
    sortProfile($(this).data('index'), $(this).data('direction'));
});

$('table#profiles-list').on('click', '.delete-profile', function() {
    deleteProfile($(this).data('index'));
});

$('table#profiles-list').on('focusin', '.profile-name', function() {
    $(this).keypress( (event) => {
        if(event.which === 13) {
            event.preventDefault();
            $(this).blur();
        }
    });
});

$('table#profiles-list').on('focusout', '.profile-name', function() {
    $(this).unbind('keypress');
    let index = $(this).data('index');
    let oldName = allProfiles[index].name;
    let newName = $(this).text();

    if(oldName !== newName) messager.send('renameProfile', index, newName);
});

$('.add-profile').click(profileNew);

//------------------------------
// Related to installed mods page
$(document).on('click', 'table#installed-mods-list tbody tr', requestInstalledModInfo);

$(document).on('click', '.download-mod', function() {
    let id = $(this).data('id');
    let url = $(this).data('url');
    messager.send('requestDownload', id, url);
});

$(document).on('click', '.delete', function() {
    $(this).text('Are you sure?');
    $(this).removeClass('delete');
    $(this).addClass('delete-sure');
});

$(document).on('click', '.delete-sure', function() {
    // Send request to delete
    let modName = selectedMod.name;
    let modVersion = selectedMod.version;
    messager.send('deleteMod', modName, modVersion);

    // Deselect mod and set the page to initial state
    selectedMod = null;
    $('table#installed-mods-list tbody tr').removeClass('info');

    let table = $('table#installed-mod-info');
    table.children().remove();
    table.append(`<thead><tr class="bg-warning"><th>Select a mod in the list to view info</th></tr></thead>`);
});

//------------------------------
// Related to about page
$("#about").on('click', 'a', function(event) {
    event.preventDefault();
    this.blur();
    shell.openExternal($(this).attr('href'));
});

//---------------------------------------------------------
//---------------------------------------------------------
$(document).ready(function() {
    messager.send('requestAllProfiles');
    messager.send('requestActiveProfile');

    messager.send('requestInstalledMods');
    messager.send('requestOnlineMods');

    messager.send('requestModFetchStatus');
    messager.send('requestPlayerInfo');
    messager.send('requestFactorioVersion');

    messager.send('requestAppVersionInfo');

    $(function () { $('[data-toggle="tooltip"]').tooltip() });
});

//---------------------------------------------------------
//---------------------------------------------------------
// Related to profiles

function listActiveProfile() {
    let table = $('table').filter('#active-profile');
    let tableBody = table.find('tbody').empty();

    table.find('th').text(activeProfile.name);

    for(let i = 0, bound = activeProfile.mods.length; i < bound; i++) {
        let mod = activeProfile.mods[i];

        tableBody.append(
            $('<tr />')
                .addClass(() => {if(mod.enabled === 'false') return 'danger'})
                .append(
                    $('<td />')
                        .addClass('small-cell')
                        .append(
                            $('<input type="checkbox" />')
                                .addClass('checkbox')
                                .data('index', i)
                                .prop('checked', mod.enabled === "true")
                        )
                )
                .append(
                    $('<td />')
                        .text(mod.name)
                )
        );
    }
};

function listAllProfiles() {
    let tableBody = $('table').filter('#profiles-list').find('tbody').empty();

    for(let i = 0, bound = allProfiles.length; i < bound; i++) {
        tableBody.append(
            $('<tr />')
                .addClass(() => {if(allProfiles[i].enabled) return 'info'})
                .append(
                    $('<td />')
                        .addClass('small-cell')
                        .append(
                            $('<input type="radio" />')
                                .attr('name', 'select-profile')
                                .data('index', i)
                                .addClass(() => {if(!allProfiles[i].enabled) return 'select-profile'})
                                .prop('checked', allProfiles[i].enabled)
                        )
                )
                .append(
                    $('<td />')
                        .addClass('profile-name editable')
                        .data('index', i)
                        .prop('contenteditable', true)
                        .text(allProfiles[i].name)
                )
                .append(
                    $('<td />')
                        .addClass('small-cell sort-profile')
                        .data('index', i)
                        .data('direction', 'down')
                        .append(() => {
                            if(i < bound - 1) {
                                return $('<span />')
                                    .addClass('glyphicon glyphicon-arrow-down')
                            }
                        })
                )
                .append(
                    $('<td />')
                        .addClass('small-cell sort-profile')
                        .data('index', i)
                        .data('direction', 'up')
                        .append(() => {
                            if(i > 0) {
                                return $('<span />')
                                    .addClass('glyphicon glyphicon-arrow-up')
                            }
                        })
                )
                .append(
                    $('<td />')
                        .addClass('small-cell delete-profile')
                        .data('index', i)
                        .append(
                            $('<span />')
                                .addClass('glyphicon glyphicon-remove text-danger')
                        )
                )
        );
    }
};

function profileNew() {
    messager.send('newProfile');
};

function deleteProfile(index) {
    messager.send('deleteProfile', index);
};

function activateProfile(index) {
    messager.send('activateProfile', index);
};

function sortProfile(index, direction) {
    messager.send('sortProfile', index, direction);
};

function toggleMod(checked, index) {
    let selectedRow = $('table#active-profile tbody tr').eq(index);
    selectedRow.toggleClass('danger');
    messager.send('toggleMod', selectedRow.children().eq(1).text());
};

//---------------------------------------------------------
//---------------------------------------------------------
// Related to installed mods page
function listInstalledMods() {
    let mods = installedMods;

    let table = $('table#installed-mods-list');
    table.children().remove();

    table.append('<thead><tr class="bg-primary"><th colspan="2">All Installed Mods</th></tr></thead>');
    table.append('<tbody>');


    for(let i = 0; i < mods.length; i++) {
        let dependencies = getMissingDependencies(mods[i]);
        let dependencyIndicator = '<a href="#" class="red" data-toggle="tooltip" title="Missing required dependency"><i class="glyphicon glyphicon-info-sign"></i></a>';

        if(!dependencies || dependencies.required.length === 0) {
            table.append(`<tr id="${i}"><td>${mods[i].name}</td><td><span>${mods[i].version}</span></td></tr>`);
        }
        else {
            table.append(`<tr id="${i}"><td>${mods[i].name}</td><td>${dependencyIndicator}  <span>${mods[i].version}</span></td></tr>`);
        }
    }
    table.append('</tbody>');
    $(function () { $('[data-toggle="tooltip"]').tooltip() });

}

function requestInstalledModInfo() {
    $('table#installed-mods-list tbody tr').removeClass('info');
    $(this).addClass('info');

    showInstalledModInfo(installedMods[$(this).attr('id')]);
}

function showInstalledModInfo(mod) {
    selectedMod = mod;
    let table = $('table#installed-mod-info');
    table.children().remove();

    table.append(`<thead><tr class="bg-info"><th colspan="2">${mod['title']}</th></tr></thead>`);
    table.append('<tbody>');
    let tableBody = $('table#installed-mod-info tbody');

    if(mod.name !== 'base') { // Don't want users deleting this one!
        tableBody.append(`<tr><td colspan="2"><button type="button" class="btn btn-block btn-danger delete">Delete Mod</button></td></tr>`);
    }

    let onlineMod = getOnlineModByName(mod.name);
    let onlineModRelease;
    if(onlineMod) onlineModRelease = getLatestCompatibleRelease(onlineMod);
    if(onlineModRelease && isSameMajorVersion(onlineModRelease.factorio_version, factorioVersion) && isVersionHigher(mod.version, onlineModRelease.version)) {
        tableBody.append(`<tr><th data-id="${onlineMod.id}" data-url="${onlineModRelease.download_url}" class="center download-mod" colspan="2"><a href="#">Update Mod - Version ${onlineModRelease.version}</a></th></tr>`);
    }

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

        if(Array.isArray(dependencies)) {
            tableBody.append(`<tr><td>Dependencies</td><td>${dependencies[0]}</td></tr>`);
            for(let i = 1; i < dependencies.length; i++) {
                tableBody.append(`<tr><td></td><td>${dependencies[i]}</td></tr>`);
            }
        }
        else tableBody.append(`<tr><td>Dependencies</td><td>${dependencies}</td></tr>`);
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

//---------------------------------------------------------
//---------------------------------------------------------
// Related to about page

function showAppVersion(version, latestVersion, latestVersionLink) {
    $('#app-version').html(() => {
        if(latestVersion && isVersionHigher(version, latestVersion)) {
            return `${version} -- Latest: ${latestVersion} (<a id="app-version-link" href="${latestVersionLink}">View it here</a>)`;
        }
        else {
            return `${version} -- Up to date`;
        }
    });
};

//---------------------------------------------------------
//---------------------------------------------------------
// Misc logic and helpers

function isVersionHigher(currentVersion, checkedVersion) {
    // Expecting version to be the following format: major.minor.patch
    let version1 = currentVersion.split('.');
    let version2 = checkedVersion.split('.');

    for(i = 0; i < 3; i++) {
        let temp1 = parseInt(version1[i]), temp2 = parseInt(version2[i]);
        if(temp1 < temp2) return true;
        else if(temp1 > temp2) return false;
    }

    return false;
};

function checkModVersions() {
    let updateIndicator = '<a href="#" data-toggle="tooltip" title="Newer version available for download"><i class="glyphicon glyphicon-info-sign"></i></a>';

    $('table#installed-mods-list tbody').children().each(function(index) {
        let mod = $(this).children().first().text();
        let version = $(this).children().last().text();

        if(hasUpdate(getModByName(mod))) {
            let existingHTML = $(this).children().last().html();
            $(this).children().last().html(updateIndicator + '  ' + existingHTML);
        }
    });

    $(function () { $('[data-toggle="tooltip"]').tooltip() });
}

function getMissingDependencies(mod) {
    if(!mod.dependencies || mod.dependencies.length === 0) return null;

    let modDependencies = {
        'required': [],
        'optional': []
    };

    for(let i = 0; i < mod.dependencies.length; i++) {
        let dependencyFull = mod.dependencies[i].slice().trim();
        let dependencyOptional;
        let dependencyName;
        let dependencyVersion;

        dependencyOptional = dependencyFull[0] === '?';
        if(dependencyOptional) dependencyFull = dependencyFull.slice(1);

        let index = dependencyFull.indexOf('>=');
        if(index !== -1) {
            dependencyName = dependencyFull.slice(0, index).trim();
            dependencyVersion = dependencyFull.slice(index + 2).trim();
        }
        else {
            dependencyName = dependencyFull.slice().trim();
            dependencyVersion = '0.0.0'; // Makes other logic easier than leaving undefined
        }

        if(!isModInstalled(dependencyName) || isVersionHigher(getModByName(dependencyName).version, dependencyVersion)) {
            if(dependencyOptional) modDependencies.optional.push(dependencyName);
            else modDependencies.required.push(dependencyName);
        }

    }
    return modDependencies;
}

function hasUpdate(mod) {
    let length = onlineMods.length;
    for(let i = 0; i < length; i++) {
        if(mod.name === onlineMods[i].name) {
            for(let j = 0; j < onlineMods[i].releases.length; j++) {
                if(isSameMajorVersion(onlineMods[i].releases[j].factorio_version, factorioVersion) &&
                isVersionHigher(mod.version, onlineMods[i].releases[j].version) ) {
                    return true;
                }
            }
            return false;
        }
    }
    return false;
}

function isSameMajorVersion(version1, version2) {
    version1 = version1.split('.');
    version2 = version2.split('.');

    return version1[0] === version2[0] && version1[1] === version2[1];
}

function getLatestCompatibleRelease(onlineMod) {
    for(let i = 0; i < onlineMod.releases.length; i++) {
        if(isSameMajorVersion(onlineMod.releases[i].factorio_version, factorioVersion)) {
            return onlineMod.releases[i];
        }
    }
}

function isModInstalled(modName) {
    for(let i = 0; i < installedMods.length; i++) {
        if(installedMods[i].name === modName) return true;
    }
    return false;
}

function getModByName(modName) {
    for(let i = 0; i < installedMods.length; i++) {
        if(installedMods[i].name === modName) return installedMods[i];
    }
    return null;
}

function getOnlineModByName(modName) {
    if(onlineMods) {
        for(let i = 0; i < onlineMods.length; i++) {
            if(onlineMods[i].name === modName) return onlineMods[i];
        }
    }
    return null;
}

function changeView(newView) {
    let buttons = $('button.changeView');
    let views = $('.main-view');

    buttons.addClass('btn-default').removeClass('btn-primary').prop('disabled', false);
    buttons.filter(`[data-view=${newView}]`).addClass('btn-primary').removeClass('btn-default').prop('disabled', true);

    views.css('display', 'none');
    views.filter(`#${newView}`).css('display', 'block');
};

function showLoadingStatus(loaded, page, pageCount) {
    if(loaded) {
        $('#modsLoadedStatus').html('<span class="glyphicon glyphicon-ok"></span>  All Mods Fetched');
    }
    else {
        if(loaded === null) {
            $('#modsLoadedStatus').html('<span class="glyphicon glyphicon-info-sign"></span>  Error Fetching Mods');
        }
        else if(page && pageCount) {
            let percent = Math.floor(page / pageCount * 100);
            $('#modsLoadedStatus').html(`<span class="glyphicon glyphicon-refresh"></span>  Fetching Mods - ${percent}%`);
        }
        else {
            $('#modsLoadedStatus').html(`<span class="glyphicon glyphicon-refresh"></span>  Fetching Mods`);
        }
    }
};

function showPlayerInfo(username) {
    let playerInfoTooltip = $('a#playerInfo');
    let playerInfoText = $('span#playerInfoText');

    if(username === '') {
        let titleText = 'Your Factorio credentials were not found. You will be unable to download mods.';

        playerInfoText.text('Not Logged In');
        playerInfoTooltip.attr('data-original-title', titleText);
    }
    else {
        let titleText = `You can download mods. You are logged in as: ${username}`;

        playerInfoText.text('Logged In');
        playerInfoTooltip.attr('data-original-title', titleText);
    }
};

function showModDownloadStatus(status, modName) {
    let display = $('#modDownloadStatus');

    // Doing this to reset the animation timer and make it visible
    display.removeClass('temporary');
    display.addClass('temporary');

    if(status === "starting") {
        display.html(`<span class="glyphicon glyphicon-refresh"></span>  Beginning mod download: ${modName}`);
    }
    else if(status === "finished") {
        display.html('<span class="glyphicon glyphicon-ok"></span>  Finished mod download');
    }
};