const messager = require('electron').ipcRenderer;

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
                                .attr('name', 'profileChoice')
                                .data('index', i)
                                .addClass(() => {if(allProfiles[i].enabled) return 'select-profile'})
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
}

//---------------------------------------------------------
//---------------------------------------------------------
// Misc logic and helpers

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
}

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
}

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
}