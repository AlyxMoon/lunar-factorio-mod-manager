const messager = require('electron').ipcRenderer;

let installedMods;
let onlineMods;
let selectedMod;

let factorioVersion;

//---------------------------------------------------------
// Event listeners for client and server events

messager.on('dataInstalledMods', function(event, mods) {
    installedMods = mods;
    listInstalledMods();
    if(onlineMods) checkModVersions();
});
messager.on('dataModFetchStatus', function(event, loaded, page, pageCount) {
    if(loaded) {
        messager.once('dataOnlineMods', function(event, mods) {
            onlineMods = mods;
            checkModVersions();
        });
        messager.send('requestOnlineMods');
    }

});

messager.on('dataFactorioVersion', function(event, version) {
    factorioVersion = version;
});

// Uses this way to assign events to elements as they will be dynamically generated
$(document).on('click', 'table#mods-list tbody tr', requestInstalledModInfo);
$(document).on('click', '.download-mod', function() {
    let id = $(this).data('id');
    let url = $(this).data('url');
    messager.send('requestDownload', id, url);
});

//---------------------------------------------------------
//---------------------------------------------------------
$(document).ready(function() {
    messager.send('requestFactorioVersion');
    messager.send('requestInstalledMods');

});

// Used as callback function
// One argument, an array of strings, representing the names of mods installed
function listInstalledMods() {
    let mods = installedMods;

    let table = $('table#mods-list');
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

// Will return the info pulled from the info.json file of the selected mod
function requestInstalledModInfo() {
    $('table#mods-list tbody tr').removeClass('info');
    $(this).addClass('info');

    showInstalledModInfo(installedMods[$(this).attr('id')]);
}

function showInstalledModInfo(mod) {
    selectedMod = mod;
    let table = $('table#mod-info');
    table.children().remove();

    table.append(`<thead><tr class="bg-info"><th colspan="2">${mod['title']}</th></tr></thead>`);
    table.append('<tbody>');
    let tableBody = $('table#mod-info tbody');

    let onlineMod = getOnlineModByName(mod.name);
    let onlineModRelease;
    if(onlineMod) onlineModsRelease = getLatestCompatibleRelease(onlineMod);
    if(onlineModRelease && onlineModRelease.factorio_version === factorioVersion && isVersionHigher(mod.version, onlineModRelease.version)) {
        // TODO: Rework download behavior before this will work correctly
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
        tableBody.append(`<tr><td>Dependencies</td><td>${dependencies[0]}</td></tr>`);
        for(let i = 1; i < dependencies.length; i++) {
            tableBody.append(`<tr><td></td><td>${dependencies[i]}</td></tr>`);
        }
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

function checkModVersions() {
    let updateIndicator = '<a href="#" data-toggle="tooltip" title="Newer version available for download"><i class="glyphicon glyphicon-info-sign"></i></a>';

    $('table#mods-list tbody').children().each(function(index) {
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
                if(onlineMods[i].releases[j].factorio_version === factorioVersion &&
                isVersionHigher(mod.version, onlineMods[i].releases[j].version) ) {
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

function getLatestCompatibleRelease(onlineMod) {
    for(let i = 0; i < onlineMod.releases.length; i++) {
        if(onlineMod.releases[i].factorio_version === factorioVersion) {
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