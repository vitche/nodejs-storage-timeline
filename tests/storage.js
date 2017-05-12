var q = require('q');
var baseTest = require('../base-test');
var storageTimeline = require('../main');
exports.tearDown = baseTest.deleteTimeLines;
exports.testList = function (test) {
    var storage = new storageTimeline.Storage('./files');
    // Many promises to create time lines
    var createPromises = [];
    for (var i = 0; i < 7; i++) {
        var promise = q.Promise(function (resolve, reject) {
            storage.create('schema-' + i, function (error) {
                if (undefined != error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
        createPromises.push(promise);
    }
    // Create many time lines
    q.all(createPromises).then(function () {
        storage.list(function (error, schemas) {
            if (undefined != error) {
                test.fail();
                test.done();
                return;
            }
            test.equal(schemas.length, 7, 'Expected 7 schemas');
            test.done();
        });
    }).fail(function (error) {
        test.fail(error);
        test.done();
    }).done();
};
