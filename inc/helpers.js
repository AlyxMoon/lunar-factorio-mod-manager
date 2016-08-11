module.exports = {
    sortArrayByProp: function(arr, property) {
        let prop = property.split('.');
        let len = prop.length;

        arr.sort(function (a, b) {
            let i = 0;
            while( i < len ) { a = a[prop[i]].toLowerCase(); b = b[prop[i]].toLowerCase(); i++; }
            if (a < b) return -1;
            else if (a > b) return 1;
            else  return 0;
        });
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
