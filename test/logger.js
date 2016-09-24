var chai = require('chai');
var expect = chai.expect;

describe('Logger class', function() {
    var file = require('fs');
    var path = require('path');

    var logger = require('../lib/logger.js');
    var defaultPath = path.join(__dirname, '/testLog.txt');
    var defaultDebugLevel = 0;

    beforeEach(function() {
        logger.logPath = defaultPath;
        logger.debugLevel = defaultDebugLevel;
    });
    afterEach(function() {
        try {
            file.unlinkSync(defaultPath);
        }
        catch(error) {

        }
    });

    it('Should set internal variables on creation', function() {
        expect(logger.logPath, 'logPath does not exist').to.exist;
        expect(logger.debugLevel, 'debugLevel does not exist').to.exist;
    });

    describe('getLogPath()', function() {
        it('should return logPath', function() {
            expect(logger.getLogPath(), 'Does not return correct path').to.equal(defaultPath);
        });
    });
    describe('setLogPath(logPath)', function() {
        it('should change the value of logPath', function() {
            var newPath = __dirname + '/newPath.txt';
            logger.setLogPath(newPath);
            expect(logger.getLogPath(), 'Did not correctly change path').to.equal(newPath);
        });
        it('should only allow a valid path string', function() {
            expect(logger.setLogPath(), 'should return false on failure').to.be.false;

            logger.setLogPath();
            expect(logger.getLogPath()).to.equal(defaultPath);

            logger.setLogPath(null);
            expect(logger.getLogPath()).to.equal(defaultPath);

            logger.setLogPath(0);
            expect(logger.getLogPath()).to.equal(defaultPath);

            logger.setLogPath('not a real path');
            expect(logger.getLogPath()).to.equal(defaultPath);

            logger.setLogPath('C:\\test\\noExtension');
            expect(logger.getLogPath()).to.equal(defaultPath);

            var realPath = path.join('C:', 'test', 'realPath.txt');
            logger.setLogPath(realPath);
            expect(logger.getLogPath()).to.equal(realPath);

            var alsoRealPath = path.join('..', 'alsoRealPath.txt');
            logger.setLogPath(alsoRealPath);
            expect(logger.getLogPath()).to.equal(alsoRealPath);

        });
    });

    describe('getDebugLevel()', function() {
        it('should return debugLevel', function() {
            expect(logger.getDebugLevel(), 'Does not return correct value').to.equal(defaultDebugLevel);
        });
    });

    describe('setDebugLevel(debugLevel)', function() {
        it('should change the value of debugLevel', function() {
            var newDebugLevel = 4;
            logger.setDebugLevel(newDebugLevel);
            expect(logger.getDebugLevel(), 'Did not correctly change value').to.equal(newDebugLevel);
        });
        it('should only change value if an acceptable debug level is given (0 - 4)', function() {
            expect(logger.setDebugLevel(-1), 'Does not return false on failure - less than 0').to.be.false;
            expect(logger.getDebugLevel(), 'Changed value to less than 0').to.equal(defaultDebugLevel);

            expect(logger.setDebugLevel(5), 'Does not return false on failure - greater than 4').to.be.false;
            expect(logger.getDebugLevel(), 'Changed value to greater than 4').to.equal(defaultDebugLevel);

            expect(logger.setDebugLevel(), 'Does not return false on failure - blank argument').to.be.false;
            expect(logger.getDebugLevel(), 'Changes value for blank argument').to.equal(defaultDebugLevel);

            expect(logger.setDebugLevel(null), 'Does not return false on failure - null argument').to.be.false;
            expect(logger.getDebugLevel(), 'Changes value for null argument').to.equal(defaultDebugLevel);

            expect(logger.setDebugLevel('4'), 'Does not return false on failure - string argument').to.be.false;
            expect(logger.getDebugLevel(), 'Changes value for string argument').to.equal(defaultDebugLevel);
        });
    });

    describe('loadLogFile(callback)', function() {
        it('should throw error if callback is not provided', function() {
            expect(logger.loadLogFile).to.throw(/not a function/);
        });
        it('should give error in callback if file does not exist', function(done) {
            var logText = 'test';

            logger.loadLogFile(function(error, data) {
                expect(error).to.be.okay;
                expect(error.code).to.equal('ENOENT');
                expect(data).to.not.be.okay;
                done();
            });
        });
        it('should give correct information in callback', function(done) {
            var logText = 'test';
            file.writeFileSync(defaultPath, logText);

            logger.loadLogFile(function(error, data) {
                expect(error).to.not.be.okay;
                expect(data).to.equal(logText);
                done();
            });

        });
    });

    describe('clearLogFile(callback)', function() {
        var logText = 'test';

        beforeEach(function(done) {
            file.writeFile(defaultPath, logText, function() {
                done();
            });
        });

        it('file still exists after clearing out', function(done) {
            logger.clearLogFile(function(error) {
                expect(error).to.not.be.okay;
                expect(function() {
                    file.readFileSync(defaultPath, 'utf8');
                }).to.not.throw(Error)

                done();
            });
        });
        it('file should be blank', function(done) {
            logger.clearLogFile(function(error) {
                logger.loadLogFile(function(error, data) {
                    expect(data).to.equal('');

                    done();
                });
            });
        });
    });

    describe('log(level, message, [data])', function() {
        it('should return false if arguments not provided correctly', function(done) {
            expect(logger.log()).to.be.false;
            expect(logger.log('0', 'test')).to.be.false;
            expect(logger.log(-1, 'test')).to.be.false;
            expect(logger.log(5, 'test')).to.be.false;
            expect(logger.log(0)).to.be.false;

            logger.loadLogFile(function(error, data) {
                expect(error.code).to.equal('ENOENT');
                done();
            });
        });
        it('saves logs correctly with `level` and `message` set', function(done) {
            let moment = require('moment');

            var debugLevel = 4;
            var message = 'test';
            var result = logger.log(debugLevel, message);

            logger.loadLogFile(function(error, data) {
                var logData = data.split('|');

                expect(result, 'should return true on success').to.be.true;
                expect(moment(logData[0].trim(), 'YYYY-MM-DD HH:mm:ss', true).isValid(), 'should have correctly formatted timestamp').to.be.true;
                expect(logData[1].trim(), 'should have debug text correct').to.equal('CRITICAL');
                expect(logData[2].trim(), 'should save message with trimming').to.equal(String(message).trim());

                done();
            });
        });
        it('saves logs correctly when `data` is an array', function(done) {
            let moment = require('moment');

            var debugLevel = 4;
            var message = 'test';
            var data = [0, 2, 'someValue'];

            var result = logger.log(debugLevel, message, data);

            logger.loadLogFile(function(error, data) {
                var logData = data.split('\n');
                logData.pop(); // Last newline will cause last item in array to be an empty string
                var firstLine = logData[0].split('|');

                expect(result, 'should return true on success').to.be.true;
                expect(logData.length).to.equal(4);
                expect(moment(firstLine[0].trim(), 'YYYY-MM-DD HH:mm:ss', true).isValid(), 'should have correctly formatted timestamp').to.be.true;
                expect(firstLine[1].trim(), 'should have debug text correct').to.equal('CRITICAL');
                expect(firstLine[2].trim(), 'should save message with trimming').to.equal(String(message).trim());

                expect(logData[1].trim()).to.equal('0 : 0');
                expect(logData[2].trim()).to.equal('1 : 2');
                expect(logData[3].trim()).to.equal('2 : someValue');

                done();
            });
        });
        it('saves logs correctly when `data` is an object', function(done) {
            let moment = require('moment');

            var debugLevel = 4;
            var message = 'test';
            var data = {
                0 : 10,
                2 : 20,
                'key1' : 'someValue'
            };

            var result = logger.log(debugLevel, message, data);

            logger.loadLogFile(function(error, data) {
                var logData = data.split('\n');
                logData.pop(); // Last newline will cause last item in array to be an empty string
                var firstLine = logData[0].split('|');

                expect(result, 'should return true on success').to.be.true;
                expect(logData.length).to.equal(4);
                expect(moment(firstLine[0].trim(), 'YYYY-MM-DD HH:mm:ss', true).isValid(), 'should have correctly formatted timestamp').to.be.true;
                expect(firstLine[1].trim(), 'should have debug text correct').to.equal('CRITICAL');
                expect(firstLine[2].trim(), 'should save message with trimming').to.equal(String(message).trim());

                expect(logData[1].trim()).to.equal('0 : 10');
                expect(logData[2].trim()).to.equal('2 : 20');
                expect(logData[3].trim()).to.equal('key1 : someValue');

                done();
            });
        });
        it('only saves logs when provided level is higher than logger debug level', function() {
            logger.setDebugLevel(0);
            expect(logger.log(0, 'test'), 'Log called with 0 - Logger 0').to.be.true;
            expect(logger.log(1, 'test'), 'Log called with 1 - Logger 0').to.be.true;
            expect(logger.log(2, 'test'), 'Log called with 2 - Logger 0').to.be.true;
            expect(logger.log(3, 'test'), 'Log called with 3 - Logger 0').to.be.true;
            expect(logger.log(4, 'test'), 'Log called with 4 - Logger 0').to.be.true;

            logger.setDebugLevel(1);
            expect(logger.log(0, 'test'), 'Log called with 0 - Logger 1').to.be.false;
            expect(logger.log(1, 'test'), 'Log called with 1 - Logger 1').to.be.true;
            expect(logger.log(2, 'test'), 'Log called with 2 - Logger 1').to.be.true;
            expect(logger.log(3, 'test'), 'Log called with 3 - Logger 1').to.be.true;
            expect(logger.log(4, 'test'), 'Log called with 4 - Logger 1').to.be.true;

            logger.setDebugLevel(2);
            expect(logger.log(0, 'test'), 'Log called with 0 - Logger 2').to.be.false;
            expect(logger.log(1, 'test'), 'Log called with 1 - Logger 2').to.be.false;
            expect(logger.log(2, 'test'), 'Log called with 2 - Logger 2').to.be.true;
            expect(logger.log(3, 'test'), 'Log called with 3 - Logger 2').to.be.true;
            expect(logger.log(4, 'test'), 'Log called with 4 - Logger 2').to.be.true;

            logger.setDebugLevel(3);
            expect(logger.log(0, 'test'), 'Log called with 0 - Logger 3').to.be.false;
            expect(logger.log(1, 'test'), 'Log called with 1 - Logger 3').to.be.false;
            expect(logger.log(2, 'test'), 'Log called with 2 - Logger 3').to.be.false;
            expect(logger.log(3, 'test'), 'Log called with 3 - Logger 3').to.be.true;
            expect(logger.log(4, 'test'), 'Log called with 4 - Logger 3').to.be.true;

            logger.setDebugLevel(4);
            expect(logger.log(0, 'test'), 'Log called with 0 - Logger 4').to.be.false;
            expect(logger.log(1, 'test'), 'Log called with 1 - Logger 4').to.be.false;
            expect(logger.log(2, 'test'), 'Log called with 2 - Logger 4').to.be.false;
            expect(logger.log(3, 'test'), 'Log called with 3 - Logger 4').to.be.false;
            expect(logger.log(4, 'test'), 'Log called with 4 - Logger 4').to.be.true;

        });
    });

});