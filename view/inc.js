const messager = require('electron').ipcRenderer;

//---------------------------------------------------------
// Event listeners for client and server events needed for all pages
messager.on('ping', function(event, message) {
    console.log(message);
});

messager.on('modsLoadedStatus', function(event, loaded, page, pageCount) {
    showLoadingStatus(loaded, page, pageCount);
});
messager.on('dataPlayerInfo', function(event, username) {
    showPlayerInfo(username);
});

messager.on('dataModDownloadStatus', function(event, status, modName) {
    showModDownloadStatus(status, modName);
});

$('button#start-factorio').click(function() {
    messager.send('startGame');
});
$('button#page-profiles').click(function() {
    messager.send('changePage', 'page_profiles');
});
$('button#page-installedMods').click(function() {
    messager.send('changePage', 'page_installedMods');
});
$('button#page-onlineMods').click(function() {
    messager.send('changePage', 'page_onlineMods');
});
//---------------------------------------------------------
//---------------------------------------------------------
$(document).ready(function() {
    messager.send('areModsLoaded');
    messager.send('requestPlayerInfo');
    messager.send('requestFactorioVersion');

    $(function () { $('[data-toggle="tooltip"]').tooltip() });
});

//---------------------------------------------------------
// Misc logic and helpers

function showLoadingStatus(loaded, page, pageCount) {
    if(loaded) {
        $('#modsLoadedStatus').html('<span class="glyphicon glyphicon-ok"></span>  All Mods Fetched');
    }
    else {
        $('#modsLoadedStatus').html(`<span class="glyphicon glyphicon-refresh"></span>  Fetching Mods - ${page}/${pageCount}`);
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