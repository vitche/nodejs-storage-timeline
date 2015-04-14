var q = require('q');
var baseTest = require('./../base-test');
var storageTimeline = require('../modules/nodejs-storage-timeline');
function _createSchema(callback) {
    var storage = new storageTimeline.Storage('./files');
    storage.create('schema-1', function (error) {
        if (undefined != error) {
            callback(error);
            return;
        }
        var schema = storage.get('schema-1');
        callback(undefined, schema);
    });
};
exports.tearDown = baseTest.deleteTimeLines;
exports.testCreate = function (test) {
    _createSchema(function (error, schema) {
        if (undefined != error) {
            test.fail(error);
            test.done();
        } else {
            // Create 100 time lines
            for (var i = 0; i < 7; i++) {
                schema.create('timeline-' + i, function (error) {
                    if (undefined != error) {
                        test.fail();
                        test.done();
                        return;
                    }
                });
            }
            test.done();
        }
    });
};
exports.testList = function (test) {
    var schema = _createSchema(function (error, schema) {
        if (undefined != error) {
            test.fail(error);
            test.done();
        } else {
            // Promises to create 100 time lines
            var createPromises = [];
            for (var i = 0; i < 7; i++) {
                var promise = q.Promise(function (resolve, reject) {
                    schema.create('timeline-' + i, function (error) {
                        if (undefined != error) {
                            reject(error);
                            return;
                        }
                        resolve();
                    });
                });
                createPromises.push(promise);
            }
            // Create 100 time lines
            q.all(createPromises).then(function () {
                // List created time lines
                schema.list(function (error, timeLines) {
                    if (undefined != error) {
                        test.fail();
                        test.done();
                        return;
                    }
                    // Check that 100 time lines were created
                    test.equal(timeLines.length, 7, 'Expected 7 time lines');
                    test.done();
                });
            }).fail(function (error) {
                test.fail(error);
                test.done();
            }).done();
        }
    });
};
exports.testGet = function (test) {
    _createSchema(function (error, schema) {
        if (undefined != error) {
            test.fail();
            test.done();
            return;
        }
        // Promises to create 100 time lines
        var createPromises = [];
        for (var i = 0; i < 7; i++) {
            var promise = q.Promise(function (resolve, reject) {
                schema.create('timeline-' + i, function (error) {
                    if (undefined != error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });
            createPromises.push(promise);
        }
        // Create 100 time lines
        q.all(createPromises).then(function () {
            // 100 times get the given time line
            for (var i = 0; i < 7; i++) {
                var timeLine = schema.get('timeline-' + i);
                test.notEqual(timeLine, undefined, 'Expected to get a time line');
            }
            test.done();
        }).fail(function (error) {
            test.fail(error);
            test.done();
        }).done();
    });
};
