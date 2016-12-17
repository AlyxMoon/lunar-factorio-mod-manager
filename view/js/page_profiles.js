const messager = require('electron').ipcRenderer;

let profiles;
let activeProfile;

//---------------------------------------------------------
// Event listeners for client and server events

messager.on('dataActiveProfile', listActiveProfile);
messager.on('dataAllProfiles', listAllProfiles);

// Uses this way to assign events to elements as they will be dynamically generated
// $(document).on('click', '.profile-name', activateProfile);
$(document).on('change', '.checkbox', function() {
    toggleMod(this.checked, $(this).data('index'));
});
$(document).on('click', '.select-profile', function() {
    activateProfile($(this).data('index'));
});
$(document).on('click', '.sort-profile', function() {
    sortProfile($(this).data('index'), $(this).data('direction'));
});
$(document).on('click', '.delete-profile', function() {
    deleteProfile($(this).data('index'));
});

// Events to manage editing the profile names
$(document).on('focusin', '.profile-name', function() {
    $(this).keypress( (event) => {
        if(event.which === 13) {
            event.preventDefault();
            $(this).blur();
        }
    });
});
$(document).on('focusout', '.profile-name', function() {
    $(this).unbind('keypress');
    let index = $(this).data('index');
    let oldName = profiles[index].name;
    let newName = $(this).text();

    if(oldName !== newName) messager.send('renameProfile', index, newName);
});

$('.add-profile').click(profileNew);

$('button').click(function() { $(this).blur() });

//---------------------------------------------------------
//---------------------------------------------------------

// Used as callback function
// One argument, an array of a single object containing:
//      The Factorio mod list with key "mods", a bool with key "enabled", and a string with key "name"
function listActiveProfile(event, data) {
    activeProfile = data;

    let table = $('table#active-profile');
    table.children().remove();

    table.append(`<thead><tr class="bg-info"><th colspan="2">${activeProfile.name}</th></tr></thead>`);
    table.append('<tbody>');

    let numMods = activeProfile['mods'].length;
    for(let i = 0; i < numMods; i++) {
        mod = activeProfile.mods[i];
        if(mod.enabled === "true") {
            table.append(`<tr><td class="small-cell"><input class="checkbox" type="checkbox" data-index="${i}" checked="checked"</input></td><td>${mod.name}</td></tr>`);
        }
        else {
            table.append(`<tr><td class="small-cell"><input class="checkbox" type="checkbox" data-index="${i}"</input></td><td>${mod.name}</td></tr>`);
            $('table#active-profile tbody tr').last().addClass('danger');
        }
    }
    table.append('</tbody>');
}

// Used as callback function
// One argument, an array of a objects, each containing:
//      The Factorio mod list with key "mods", a bool with key "enabled", and a string with key "name"
function listAllProfiles(event, data) {
    profiles = data;

    let tableBody = $('table#profiles-list tbody');
    tableBody.children().remove();

    let arrowUp = '<span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span>';
    let arrowDown = '<span class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span>';
    let deleteIcon = '<span class="glyphicon glyphicon-remove text-danger" aria-hidden="true"></span>';

    for(let i = 0; i < profiles.length; i++) {
        let row = $('<tr></tr>');

        if(profiles[i].enabled) row.append(`<td class="small-cell"><input type="radio" name="active" checked="true"></td>`);
        else                    row.append(`<td class="small-cell"><input data-index="${i}" class="select-profile" type="radio" name="active"></td>`);


        row.append(`<td data-index="${i}" class="profile-name editable" contenteditable="true">${profiles[i].name}</td>`);

        // Don't show down arrow if it's already on bottom
        if(i < profiles.length - 1) row.append(`<td data-index="${i}" data-direction="down" class="small-cell sort-profile">${arrowDown}</td>`);
        else                        row.append(`<td class="small-cell"></td>`);

        // Don't show up arrow if it's already on top
        if(i > 0)   row.append(`<td data-index="${i}" data-direction="up" class="small-cell sort-profile">${arrowUp}</td>`);
        else        row.append(`<td class="small-cell"></td>`);

        row.append(`<td data-index="${i}" class="small-cell delete-profile">${deleteIcon}</td>`);

        if(profiles[i]['enabled']) {
            row.addClass('info');
        }

        tableBody.append(row);
    }
}

// Used as callback function
// Takes no extra arguments
function toggleMod(checked, index) {
    let selectedRow = $('table#active-profile tbody tr').eq(index);
    selectedRow.toggleClass('danger');
    messager.send('toggleMod', selectedRow.children().eq(1).text());
}



//---------------------------------------------------------
// Button listeners for profile management

function profileNew() {
    messager.send('newProfile');
}
function profileRename() {
    let tableHead = $('table#active-profile thead');
    let profileName = tableHead.children().text();

    tableHead.children().remove();
    tableHead.append('<tr class="info"><th><textarea rows="1">' + profileName + '</textarea></th></tr>');
    $('table#active-profile thead tr').append('<th><button id="rename-submit" type="button" class="btn btn-default">Save Name</button></th>');

    $('#rename-submit').on('click', function() { messager.send('renameProfile', $('textarea').val()) });
    $('textarea').focus().select();
}

function activateProfile(index) {
    messager.send('activateProfile', index);
}

function sortProfile(index, direction) {
    messager.send('sortProfile', index, direction);
}

function deleteProfile(index) {
    messager.send('deleteProfile', index);
}

//---------------------------------------------------------
//---------------------------------------------------------