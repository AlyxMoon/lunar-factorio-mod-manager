const messager = require('electron').ipcRenderer;

//---------------------------------------------------------
// Event listeners for client and server events needed for all pages
messager.on('ping', function(event, message) {
    console.log(message);
});

messager.on('modsLoadedStatus', function(event, loaded, page, pageCount) {
    showLoadingStatus(loaded, page, pageCount);
})

$('button#start-factorio').click(function() {
    messager.send('startGame');
});
$('button#page-profiles').click(function() {
    messager.send('changePage', 'page_profiles');
});
$('button#page-localMods').click(function() {
    messager.send('changePage', 'page_localMods');
});
$('button#page-onlineMods').click(function() {
    messager.send('changePage', 'page_onlineMods');
});
//---------------------------------------------------------
//---------------------------------------------------------
$(document).ready(function() {
    messager.send('areModsLoaded');
});

function showLoadingStatus(loaded, page, pageCount) {
    if(loaded) {
        $('div#modsLoadedStatus').text('Online mods have been downloaded');
    }
    else {
        $('div#modsLoadedStatus').html(`<span class="glyphicon glyphicon-refresh"></span>  Online Mods Loading - ${page}/${pageCount}`);
    }
}
