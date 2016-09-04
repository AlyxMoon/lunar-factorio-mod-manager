module.exports = {

    sortArrayByProp: function(arr, property, property2) {
        let moment = require('moment');

        let type = null;
        if(property2 != undefined) {
            if(typeof arr[0][property][property2] === 'number') type = 'number';
            else if(moment(arr[0][property][property2], moment.ISO_8601, true).isValid()) type = 'time';
            else if(typeof arr[0][property][property2] === 'string') type = 'string';

        }
        else {
            if(typeof arr[0][property] === 'number') type = 'number';
            else if(moment(arr[0][property], moment.ISO_8601, true).isValid()) type = 'time';
            else if(typeof arr[0][property] === 'string') type = 'string';
        }

        switch(type) {
            case 'string':
                arr.sort(stringSort);
                break;
            case 'number':
                arr.sort(numberSort);
                break;
            case 'time':
                arr.sort(timeSort);
                break;
            default:
                module.exports.log(`Error sorting, property type not handled -- Prop: '${property}', Type: ${typeof arr[0][property]}`);
        }

        function stringSort(a, b) {
            if(property2 != undefined) {
                a = a[property][property2].toLowerCase();
                b = b[property][property2].toLowerCase();
            }
            else {
                a = a[property].toLowerCase();
                b = b[property].toLowerCase();
            }


            if (a < b) return -1;
            else if (a > b) return 1;
            else return 0;
        };
        function numberSort(a, b) {
            if(property2 != undefined) {
                a = a[property][property2]
                b = b[property][property2]
            }
            else {
                a = a[property]
                b = b[property]
            }

            if (a < b) return 1;
            else if (a > b) return -1;
            else return 0;
        };
        function timeSort(a, b) {
            if(property2 != undefined) {
                a = a[property][property2]
                b = b[property][property2]
            }
            else {
                a = a[property]
                b = b[property]
            }

            if (moment(a).isBefore(b)) return 1;
            else if (moment(a).isAfter(b)) return -1;
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
