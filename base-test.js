var q = require('q');
var storageTimeline = require('./main');
exports.deleteTimeLines = function (callback) {
    // Open the storage
    var storage = new storageTimeline.Storage('./files');
    // List schemas
    storage.list(function (error, schemas) {
        if (undefined != error) {
            callback();
            return;
        }
        // List time lines
        var timeLineListPromises = [];
        for (var i = 0; i < schemas.length; i++) {
            var schema = schemas[i];
            var timeLineListPromise = q.Promise(function (resolve, reject) {
                schema.list(function (error, timeLines) {
                    if (undefined != error) {
                        reject(error);
                        return;
                    }
                    resolve(timeLines);
                });
            });
            timeLineListPromises.push(timeLineListPromise);
        }
        q.all(timeLineListPromises).then(function (timeLines) {
            // Flatten time-lines
            var results = [];
            for (var i = 0; i < timeLines.length; i++) {
                results = results.concat(timeLines[i]);
            }
            // Promises to delete time lines
            var deletePromises = [];
            for (var i = 0; i < results.length; i++) {
                var timeLine = results[i];
                var deletePromise = q.Promise(function (resolve, reject) {
                    timeLine._schema.remove(timeLine._name, function (error) {
                        if (undefined != error) {
                            reject(error);
                            return;
                        }
                        resolve();
                    });
                });
                deletePromises.push(deletePromise);
            }
            // Delete all time lines
            if (0 < deletePromises.length) {
                q.all(deletePromises).then(function () {
                    callback();
                }).catch(function (error) {
                    callback(error);
                }).done();
            } else {
                callback();
            }
        }).catch(function (error) {
            callback(error);
        }).done();
    });
};