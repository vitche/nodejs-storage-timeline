var fs = require('fs');
var TimelineClass = require('./timeline');
// Represents a group of several time lines
module.exports = function (storage, name) {
    // The storage holding the current schema
    this._storage = storage;
    // Name of the given schema
    this._name = name;
    // Creates a new time line in the current schema
    this.create = function (timelineName, callback) {
        var path = this._storage._path + '/' + this._name + '/' + timelineName;
        fs.exists(path, function (exists) {
            if (exists) {
                callback();
            } else {
                fs.writeFile(path, '', function (error) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    callback();
                });
            }
        });
    };
    // Lists all schema's time lines
    this.list = function (callback) {
        var self = this;
        var path = this._storage._path + '/' + this._name;
        fs.readdir(path, function (error, fileNames) {
            if (undefined != error) {
                callback(error);
                return;
            }
            var timeLines = [];
            for (var i = 0; i < fileNames.length; i++) {
                var fileName = fileNames[i];
                var timeLine = new TimelineClass(self, fileName);
                timeLines.push(timeLine);
            }
            callback(undefined, timeLines);
        });
    };
    // Gets a time line from the current schema specified by the time line name
    this.get = function (timelineName) {
        var timeline = new TimelineClass(this, timelineName);
        return timeline;
    };
    this.remove = function (timelineName, callback) {
        var path = this._storage._path + '/' + this._name + '/' + timelineName;
        fs.unlink(path, function (error) {
            if (undefined != error) {
                callback(error);
                return;
            }
            callback();
        });
    }
};