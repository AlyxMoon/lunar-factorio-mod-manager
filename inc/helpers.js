module.exports = {

    sortArrayByProp: function(arr, property) {
        let type = null;
        if(typeof arr[0][property] === 'number') type = 'number';
        else if((new Date(arr[0][property])).getTime() > 0) type = 'time';
        else if(typeof arr[0][property] === 'string') type = 'string';


        switch(type) {
            case 'string':
                arr.sort(stringSort);
                break;
            case 'number':
                arr.sort(numberSort);
                break;

            default:
                module.exports.log(`Error sorting, property type not handled -- Prop: '${property}', Type: ${typeof arr[0][property]}`);
        }

        function stringSort(a, b) {
            a = a[property].toLowerCase();
            b = b[property].toLowerCase();

            if (a < b) return -1;
            else if (a > b) return 1;
            else return 0;
        };
        function numberSort(a, b) {
                a = a[property];
                b = b[property];

                if (a < b) return 1;
                else if (a > b) return -1;
                else return 0;
        };

        return arr;
    },

    log: function(data) {
        let file = require('fs');
        let logPath = `${__dirname}/../lmm_log.txt`;
        let dateTime = new Date();
        dateTime = dateTime.toLocaleString();

        file.appendFileSync(logPath,`${dateTime} | ${data}\n`);
    }

};
