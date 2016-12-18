const messager = require('electron').ipcRenderer;

//---------------------------------------------------------
// Event listeners for client and server events needed for all pages
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

$('button#start-factorio').click(function() {
    messager.send('startGame');
});

$('button.changeView').click(function() {
    let view = $(this).data('view');
    changeView(view);
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