var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');

var path = require('path');

var ModManager = require('../lib/modManager.js');
var logger = require('../lib/logger.js');

describe('Mod Manager', function() {
    var modListPath = path.join('somePath', 'file.json');
    var modDirectoryPath = path.join('somePath', 'someOtherPath');
    var baseModPath = path.join('somePath', 'someOtherPath', 'someOtherOtherPath');
    var playerDataPath = path.join('aPath', 'otherFile.json');

    beforeEach(function() {
        sinon.stub(logger, 'log', function() {});
    });
    afterEach(function() {
        logger.log.restore();
    });

    describe('Constructor', function() {
        it('Should have variables set as expected', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);

            expect(modManager, 'Does not exist').to.exist;
            expect(modManager.modListPath, 'modListPath not correct').to.equal(modListPath);
            expect(modManager.modDirectoryPath, 'modDirectoryPath not correct').to.equal(modDirectoryPath);
            expect(modManager.baseModPath, 'baseModPath not correct').to.equal(baseModPath);
            expect(modManager.playerDataPath, 'playerDataPath not correct').to.equal(playerDataPath);

            expect(modManager.factorioVersion, 'factorioVersion not correct').to.equal('');
            expect(modManager.playerUsername, 'playerUsername not correct').to.equal('');
            expect(modManager.playerToken, 'playerToken not correct').to.equal('');

            expect(modManager.installedMods, 'installedMods not correct').to.eql([]);
            expect(modManager.installedModsLoaded, 'installedModsLoaded not correct').to.be.false;

            expect(modManager.onlineMods, 'onlineMods not correct').to.eql([]);
            expect(modManager.onlineModsFetched, 'onlineModsFetched not correct').to.be.false;
            expect(modManager.onlineModTotalCount, 'onlineModTotalCount not correct').to.equal(0);
            expect(modManager.onlineModFetchedCount, 'onlineModFetchedCount not correct').to.equal(0);
        });
        it('Should throw error with bad modListPath', function() {
            expect(function() {
                new ModManager(0, modDirectoryPath, baseModPath, playerDataPath);
            }, 'Did not throw error when a number').to.throw(Error);
            expect(function() {
                new ModManager(null, modDirectoryPath, baseModPath, playerDataPath);
            }, 'Did not throw error when null').to.throw(Error);
            expect(function() {
                new ModManager(undefined, modDirectoryPath, baseModPath, playerDataPath);
            }, 'Did not throw error when undefined').to.throw(Error);
            expect(function() {
                new ModManager([], modDirectoryPath, baseModPath, playerDataPath);
            }, 'Did not throw error when an array').to.throw(Error);
            expect(function() {
                new ModManager({}, modDirectoryPath, baseModPath, playerDataPath);
            }, 'Did not throw error when an object').to.throw(Error);
            expect(function() {
                new ModManager(modDirectoryPath, modDirectoryPath, baseModPath, playerDataPath);
            }, 'Did not throw error when a directory').to.throw(Error);
        });
        it('Should throw error with bad modDirectoryPath', function() {
            expect(function() {
                new ModManager(modListPath, 0, baseModPath, playerDataPath);
            }, 'Did not throw error with number').to.throw(Error);
            expect(function() {
                new ModManager(modListPath, null, baseModPath, playerDataPath);
            }, 'Did not throw error when null').to.throw(Error);
            expect(function() {
                new ModManager(modListPath, undefined, baseModPath, playerDataPath);
            }, 'Did not throw error when undefined').to.throw(Error);
            expect(function() {
                new ModManager(modListPath, [], baseModPath, playerDataPath);
            }, 'Did not throw error when an array').to.throw(Error);
            expect(function() {
                new ModManager(modListPath, {}, baseModPath, playerDataPath);
            }, 'Did not throw error when an object').to.throw(Error);
            expect(function() {
                new ModManager(modListPath, modListPath, baseModPath, playerDataPath);
            }, 'Did not throw error when a file path').to.throw(Error);
        });
        it('Should throw error with bad baseModPath', function() {
            expect(function() {
                new ModManager(modListPath, modDirectoryPath, 0, playerDataPath);
            }, 'Did not throw error with number').to.throw(Error);
            expect(function() {
                new ModManager(modListPath, modDirectoryPath, null, playerDataPath);
            }, 'Did not throw error when null').to.throw(Error);
            expect(function() {
                new ModManager(modListPath, modDirectoryPath, undefined, playerDataPath);
            }, 'Did not throw error when undefined').to.throw(Error);
            expect(function() {
                new ModManager(modListPath, modDirectoryPath, [], playerDataPath);
            }, 'Did not throw error when an array').to.throw(Error);
            expect(function() {
                new ModManager(modListPath, modDirectoryPath, {}, playerDataPath);
            }, 'Did not throw error when an object').to.throw(Error);
            expect(function() {
                new ModManager(modListPath, modDirectoryPath, playerDataPath, playerDataPath);
            }, 'Did not throw error when a file path').to.throw(Error);
        });
        it('Should throw error with bad playerDataPath', function() {
            expect(function() {
                new ModManager(modListPath, modDirectoryPath, baseModPath, 0);
            }, 'Did not throw error with number').to.throw(Error);
            expect(function() {
                new ModManager(modListPath, modDirectoryPath, baseModPath, null);
            }, 'Did not throw error when null').to.throw(Error);
            expect(function() {
                new ModManager(modListPath, modDirectoryPath, baseModPath, undefined);
            }, 'Did not throw error when undefined').to.throw(Error);
            expect(function() {
                new ModManager(modListPath, modDirectoryPath, baseModPath, []);
            }, 'Did not throw error when an array').to.throw(Error);
            expect(function() {
                new ModManager(modListPath, modDirectoryPath, baseModPath, {});
            }, 'Did not throw error when an object').to.throw(Error);
            expect(function() {
                new ModManager(modListPath, modDirectoryPath, baseModPath, baseModPath);
            }, 'Did not throw error when a directory').to.throw(Error);
        });
    });
    describe('Setters', function() {
        it('setModListPath() should correctly set value and return true on success', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            var newPath = path.join('somePath', 'newFilePath.json');

            expect(modManager.setModListPath(newPath), 'Did not return true').to.be.true;
            expect(modManager.modListPath, 'Did not set value correctly').to.equal(newPath);

        });
        it('setModListPath() should return false and not change value with bad arguments', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);

            expect(modManager.setModListPath(0), 'Did not return false when a number').to.be.false;
            expect(modManager.modListPath, 'Value should not have changed').to.equal(modListPath);
            expect(modManager.setModListPath(null), 'Did not return false when null').to.be.false;
            expect(modManager.modListPath, 'Value should not have changed').to.equal(modListPath);
            expect(modManager.setModListPath(undefined), 'Did not return false when undefined').to.be.false;
            expect(modManager.modListPath, 'Value should not have changed').to.equal(modListPath);
            expect(modManager.setModListPath([]), 'Did not return false when an array').to.be.false;
            expect(modManager.modListPath, 'Value should not have changed').to.equal(modListPath);
            expect(modManager.setModListPath({}), 'Did not return false when an object').to.be.false;
            expect(modManager.modListPath, 'Value should not have changed').to.equal(modListPath);
            expect(modManager.setModListPath(modDirectoryPath), 'Did not return false when a directory').to.be.false;
            expect(modManager.modListPath, 'Value should not have changed').to.equal(modListPath);
        });
        it('setModDirectoryPath() should correctly set value and return true on success', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            var newDirectory = path.join('somePath', 'anotherDirectory');

            expect(modManager.setModDirectoryPath(newDirectory), 'Did not return true').to.be.true;
            expect(modManager.modDirectoryPath, 'Did not set value correctly').to.equal(newDirectory);

        });
        it('setModDirectoryPath() should return false and not change value with bad arguments', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);

            expect(modManager.setModDirectoryPath(0), 'Did not return false when a number').to.be.false;
            expect(modManager.modDirectoryPath, 'Value should not have changed').to.equal(modDirectoryPath);
            expect(modManager.setModDirectoryPath(null), 'Did not return false when null').to.be.false;
            expect(modManager.modDirectoryPath, 'Value should not have changed').to.equal(modDirectoryPath);
            expect(modManager.setModDirectoryPath(undefined), 'Did not return false when undefined').to.be.false;
            expect(modManager.modDirectoryPath, 'Value should not have changed').to.equal(modDirectoryPath);
            expect(modManager.setModDirectoryPath([]), 'Did not return false when an array').to.be.false;
            expect(modManager.modDirectoryPath, 'Value should not have changed').to.equal(modDirectoryPath);
            expect(modManager.setModDirectoryPath({}), 'Did not return false when an object').to.be.false;
            expect(modManager.modDirectoryPath, 'Value should not have changed').to.equal(modDirectoryPath);
            expect(modManager.setModDirectoryPath(modListPath), 'Did not return false when a file path').to.be.false;
            expect(modManager.modDirectoryPath, 'Value should not have changed').to.equal(modDirectoryPath);
        });
        it('setBaseModPath() should correctly set value and return true on success', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            var newDirectory = path.join('somePath', 'anotherDirectory');

            expect(modManager.setBaseModPath(newDirectory), 'Did not return true').to.be.true;
            expect(modManager.baseModPath, 'Did not set value correctly').to.equal(newDirectory);

        });
        it('setBaseModPath() should return false and not change value with bad arguments', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);

            expect(modManager.setBaseModPath(0), 'Did not return false when a number').to.be.false;
            expect(modManager.baseModPath, 'Value should not have changed').to.equal(baseModPath);
            expect(modManager.setBaseModPath(null), 'Did not return false when null').to.be.false;
            expect(modManager.baseModPath, 'Value should not have changed').to.equal(baseModPath);
            expect(modManager.setBaseModPath(undefined), 'Did not return false when undefined').to.be.false;
            expect(modManager.baseModPath, 'Value should not have changed').to.equal(baseModPath);
            expect(modManager.setBaseModPath([]), 'Did not return false when an array').to.be.false;
            expect(modManager.baseModPath, 'Value should not have changed').to.equal(baseModPath);
            expect(modManager.setBaseModPath({}), 'Did not return false when an object').to.be.false;
            expect(modManager.baseModPath, 'Value should not have changed').to.equal(baseModPath);
            expect(modManager.setBaseModPath(modListPath), 'Did not return false when a file path').to.be.false;
            expect(modManager.baseModPath, 'Value should not have changed').to.equal(baseModPath);
        });
        it('setPlayerDataPath() should correctly set value and return true on success', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            var newPath = path.join('somePath', 'newFilePath.json');

            expect(modManager.setPlayerDataPath(newPath), 'Did not return true').to.be.true;
            expect(modManager.playerDataPath, 'Did not set value correctly').to.equal(newPath);

        });
        it('setPlayerDataPath() should return false and not change value with bad arguments', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);

            expect(modManager.setPlayerDataPath(0), 'Did not return false when a number').to.be.false;
            expect(modManager.playerDataPath, 'Value should not have changed').to.equal(playerDataPath);
            expect(modManager.setPlayerDataPath(null), 'Did not return false when null').to.be.false;
            expect(modManager.playerDataPath, 'Value should not have changed').to.equal(playerDataPath);
            expect(modManager.setPlayerDataPath(undefined), 'Did not return false when undefined').to.be.false;
            expect(modManager.playerDataPath, 'Value should not have changed').to.equal(playerDataPath);
            expect(modManager.setPlayerDataPath([]), 'Did not return false when an array').to.be.false;
            expect(modManager.playerDataPath, 'Value should not have changed').to.equal(playerDataPath);
            expect(modManager.setPlayerDataPath({}), 'Did not return false when an object').to.be.false;
            expect(modManager.playerDataPath, 'Value should not have changed').to.equal(playerDataPath);
            expect(modManager.setPlayerDataPath(modDirectoryPath), 'Did not return false when a directory').to.be.false;
            expect(modManager.playerDataPath, 'Value should not have changed').to.equal(playerDataPath);
        });
    });
    describe('Getters', function() {
        it('getModListPath() should return that', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            expect(modManager.getModListPath()).to.equal(modListPath);
        });
        it('getModDirectoryPath() should return that', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            expect(modManager.getModDirectoryPath()).to.equal(modDirectoryPath);
        });
        it('getBaseModPath() should return that', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            expect(modManager.getBaseModPath()).to.equal(baseModPath);
        });
        it('getPlayerDataPath() should return that', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            expect(modManager.getPlayerDataPath()).to.equal(playerDataPath);
        });
        it('getPlayerUsername() should return that', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            modManager.playerUsername = 'some_random_user';
            expect(modManager.getPlayerUsername()).to.equal('some_random_user');
        });
        it('getPlayerToken() should return that', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            modManager.playerToken = 'randomString';
            expect(modManager.getPlayerToken()).to.equal('randomString');
        });
        it('getFactorioVersion() should return that', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            modManager.factorioVersion = '0.20';
            expect(modManager.getFactorioVersion()).to.equal('0.20');
        });
        it('getInstalledMods() should return that', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            var mods = [
                {
                    'name': 'testMod1',
                    'version': '1.0'
                },
                {
                    'name': 'testMod2',
                    'version': '3.0'
                }
            ];
            modManager.installedMods = mods;
            expect(modManager.getInstalledMods()).to.eql(mods);
        });
        it('getInstalledModNames() should return that', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            var mods = [
                {
                    'name': 'testMod10',
                    'version': '1.0'
                },
                {
                    'name': 'testMod20',
                    'version': '3.0'
                }
            ];
            modManager.installedMods = mods;
            expect(modManager.getInstalledModNames()).to.eql(['testMod10', 'testMod20']);
        });
        it('getInstalledModNames() should return an empty array if installedMods is not set', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            expect(modManager.getInstalledModNames()).to.eql([]);
        });
        it('getInstalledModNames() should properly leave out mods without name keys', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            var mods = [
                {
                    'name': 'testMod10',
                    'version': '1.0'
                },
                {
                    'version': '1.2.2'
                },
                {
                    'name': 'testMod20',
                    'version': '3.0'
                }
            ];
            modManager.installedMods = mods;
            expect(modManager.getInstalledModNames()).to.eql(['testMod10', 'testMod20']);
        });
        it('getOnlineMods() should return that', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            var mods = [
                {
                    'name': 'testMod1',
                    'version': '1.0'
                },
                {
                    'name': 'testMod2',
                    'version': '3.0'
                }
            ];
            modManager.onlineMods = mods;
            expect(modManager.getOnlineMods()).to.eql(mods);
        });
        it('getOnlineModNames() should return that', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            var mods = [
                {
                    'name': 'testMod10',
                    'version': '1.0'
                },
                {
                    'name': 'testMod20',
                    'version': '3.0'
                }
            ];
            modManager.installedMods = mods;
            expect(modManager.getOnlineModNames()).to.eql(['testMod10', 'testMod20']);
        });
        it('getOnlineModNames() should return an empty array if installedMods is not set', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            expect(modManager.getOnlineModNames()).to.eql([]);
        });
        it('getOnlineModNames() should properly leave out mods without name keys', function() {
            var modManager = new ModManager(modListPath, modDirectoryPath, baseModPath, playerDataPath);
            var mods = [
                {
                    'name': 'testMod10',
                    'version': '1.0'
                },
                {
                    'version': '1.2.2'
                },
                {
                    'name': 'testMod20',
                    'version': '3.0'
                }
            ];
            modManager.installedMods = mods;
            expect(modManager.getOnlineModNames()).to.eql(['testMod10', 'testMod20']);
        });
    });

});