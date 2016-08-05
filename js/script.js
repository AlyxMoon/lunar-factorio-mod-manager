$(document).ready(function() {


});

/* The input 'profiles' needs to look like this:
[
    {
        'mods': [
            {
                'name': 'Factorio Mod Name'
                'enabled': 'true' or 'false'
            }
        ]
        'name': 'Name of Profile'
    }
]
 */

function listActiveProfile(profile) {

    console.log(profile);
    let table = $('table#active-profile');
    table.css('max-height', table.parent().height());
    table.children().remove();

    table.append('<thead><tr id="active-profile-name" class="info"><th colspan="2">' + profile['name'] + '</th></tr></thead>');
    table.append('<tbody>');

    numMods = profile['mods'].length;
    for(let i = 0; i < numMods; i++) {
        mod = profile['mods'][i];
        table.append('<tr class="tbl-mod"><td>' + mod['name'] + '</td><td>' + mod['enabled'] + '</td></tr>');

        if(mod['enabled'] === 'false') {
            $('table#active-profile tbody tr').last().addClass('danger');
        }
    }
    table.append('</tbody>');
}

function listAllProfiles(profiles) {
    console.log(profiles);
    let table = $('table#all-profiles');
    table.css('max-height', table.parent().height());
    table.children().remove();

    table.append('<thead><tr><th>Profiles:</th></tr></thead>');
    table.append('<tbody>');

    for(let i = 0; i < profiles.length; i++) {
        table.append('<tr class="tbl-profile"><td>' + profiles[i]['name'] + '</td></tr>');

        if(profiles[i]['enabled']) {
            $('table#all-profiles tbody tr').last().addClass('info');
        }
    }
    table.append('</tbody>');

}

function listMods(mods) {
    console.log(mods);
    let table = $('#mods-table');
    table.css('height', table.parent().height());
    table.append('<tbody>');

    for(let i = 0; i < mods.length; i++) {
        table.append('<tr class="tbl-profile"><td>' + mods[i] + '</td></tr>');
    }
    table.append('</tbody>');

}
