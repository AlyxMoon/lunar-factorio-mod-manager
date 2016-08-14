const messager = require('electron').ipcRenderer;

//---------------------------------------------------------
// Event listeners for client and server events needed for all pages

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