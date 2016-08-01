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
function listProfiles(profiles) {
    console.log(profiles);
    var table = $('#profiles-table');
    table.css("height", table.parent().height());
    table.append("<tbody>");

    for(var i = 0; i < profiles.length; i++) {
        table.append("<tr><th>" + profiles[i]['name'] + "</th></tr>");

        numMods = profiles[i]['mods'].length;
        for(var j = 0; j < numMods - 1; j++) {
            mod = profiles[i]['mods'][j];
            table.append('<tr><th scope="row">' + mod['name'] + '</th><td>' + mod['enabled'] + '</td></tr>');

            if(mod['enabled'] === 'false') {
                $('#profiles-table tr').last().addClass('danger');
            }
        }
    }
    table.append('</tbody>');

}
