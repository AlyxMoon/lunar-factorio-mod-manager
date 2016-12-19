const messager = require('electron').ipcRenderer;
const shell = require('electron').shell;

let allProfiles;
let activeProfile;

//---------------------------------------------------------
//---------------------------------------------------------
// Event listeners for client and server events
messager.on('ping', function(event, message) {
    console.log(message);
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
messager.on('dataModFetchStatus', function(event, loaded, page, pageCount) {
    if(!loaded) {
        window.setTimeout(() => {
            messager.send('requestModFetchStatus');
        }, 1000);
    }
    else {
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

//------------------------------
// Related to profiles
messager.on('dataActiveProfile', function(event, profile) {
    activeProfile = profile;
    listActiveProfile()
});

messager.on('dataAllProfiles', function(event, profiles) {
    allProfiles = profiles;
    listAllProfiles()
});

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
// Related to about page
messager.on('dataAppVersionInfo', function(event, version, latestVersion, latestVersionLink) {
    showAppVersion(version, latestVersion, latestVersionLink);
});

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