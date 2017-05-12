var async = require('async');
var baseTest = require('../base-test');
var storageTimeline = require('../main');
function testIterations(test, timeLine, names) {
    names.push(undefined);
    timeLine.reset();
    var i = 0;
    async.eachSeries(names, function (name, callback) {
        timeLine.nextString(function (error, item) {
            if (undefined != item) {
                test.equals(item.value, names[i], item.value + ' expected to be ' + names[i]);
            }
            i++;
            callback();
        });
    }, function (error) {
        if (undefined != error) {
            test.fail();
            test.done();
            return;
        }
        test.done();
    });
}
exports.tearDown = baseTest.deleteTimeLines;
exports.testAddStrings = function (test) {
    // Open the storage
    var storage = new storageTimeline.Storage('./files');
    // Create a schema
    storage.create('schema-0', function (error) {
        if (undefined != error) {
            test.fail();
            test.done();
            return;
        }
        var schema = storage.get('schema-0');
        // Create a time line
        schema.create('timeline-0', function (error) {
            if (undefined != error) {
                test.fail();
                test.done();
                return;
            }
            var timeLine = schema.get('timeline-0');
            // Write strings to the time line
            timeLine.add("TEST.1", function () {
                timeLine.add("TEST.2", function () {
                    timeLine.add("TEST.3", function () {
                        test.done();
                    });
                });
            });
        });
    });
};
exports.testAddGetStrings = function (test) {
    // Open the storage
    var storage = new storageTimeline.Storage('./files');
    // Create a schema
    storage.create('schema-0', function (error) {
        if (undefined != error) {
            test.fail();
            test.done();
            return;
        }
        var schema = storage.get('schema-0');
        // Create a time line
        schema.create('timeline-0', function (error) {
            if (undefined != error) {
                test.fail();
                test.done();
                return;
            }
            var timeLine = schema.get('timeline-0');
            var names = ['TEST.1', "TEST.2", "TEST.3"];
            async.eachSeries(names, function (name, callback) {
                // Write strings to the time line
                timeLine.add(name, function () {
                    callback();
                });
            }, function (error) {
                if (undefined != error) {
                    test.fail();
                    test.done();
                    return;
                }
                testIterations(test, timeLine, names);
            });
        });
    });
};