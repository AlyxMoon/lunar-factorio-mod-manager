// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron');

electron.ipcRenderer.on('data', function(event, message) {
    listProfiles(message);
});

electron.ipcRenderer.on('ping', function(event, message) {
    console.log(message);
});