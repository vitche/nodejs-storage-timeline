var fs = require('fs');
var moment = require('moment');
var Int64 = require('node-int64');
function _writeInt64(buffer, value, offset) {
    value = new Int64(value).toBuffer();
    value.copy(buffer, offset);
}
function _readInt64(buffer, offset) {
    var atom = new Buffer(8);
    buffer.copy(atom, 0, offset, offset + 8);
    return new Int64(atom).toNumber();
}
function _writeString(path, value, time, callback) {
    var payloadSize = 8 + value.length;
    var buffer = new Buffer(8 + payloadSize);
    // Payload size
    _writeInt64(buffer, payloadSize, 0);
    // Time stamp
    _writeInt64(buffer, time, 8);
    // String value
    buffer.write(value, 16);
    var stream = fs.createWriteStream(path, {
        'flags': 'a'
    });
    stream.once('open', function (handle) {
        stream.write(buffer);
        stream.end();
        callback();
    });
}
function _writeNumber(path, value, time, callback) {
    var buffer = new Buffer(24);
    // Payload size (2 x 64-bit)
    _writeInt64(buffer, 16, 0);
    // Time stamp
    _writeInt64(buffer, time, 8);
    // 8-byte (64-bit) numeric value
    _writeInt64(buffer, value, 16);
    var stream = fs.createWriteStream(path, {
        'flags': 'a'
    });
    stream.once('open', function (handle) {
        stream.write(buffer);
        stream.end();
        callback();
    });
}
// Represents a time line - a group of time-based events
module.exports = function (schema, name) {
    // The schema holding the current time line
    this._schema = schema;
    // Current time line name
    this._name = name;
    this._buffer = undefined;
    this._offset = 0;
    this._getPath = function () {
        var path = schema._storage._path + '/' + schema._name + '/' + this._name;
        return path;
    };
    // Adds a time line event specified by:
    // - the given value;
    // or
    // - the given time and the given value.
    this.add = function (argument1, argument2, argument3) {
        var time = undefined;
        var value = undefined;
        var callback = undefined;
        // Check whether the second argument was specified
        if (undefined == argument3) {
            value = argument1;
            callback = argument2;
        } else {
            // This is expected to happen less often
            time = argument1;
            value = argument2;
            callback = argument3;
        }
        // Get time stamp if not available
        if (undefined == time) {
            var stamp = moment().utc();
            time = stamp.unix() * 1000 + stamp.millisecond();
        }
        // A path to the time line file
        var schema = this._schema;
        var path = this._getPath();
        // Write the value to a buffer
        switch (typeof value) {
            case 'string':
            {
                _writeString(path, value, time, callback);
                break;
            }
            case 'number':
            {
                _writeNumber(path, value, time, callback);
                break;
            }
            case 'array':
            case 'object':
            {
                value = JSON.stringify(value);
                _writeString(path, value, time, callback);
                break;
            }
        }
    };
    // Returns one next element from the time line
    this.next = function (callback) {
        var self = this;

        function readItem() {
            // Check whether more items exist
            if (self._buffer.length <= self._offset) {
                return undefined;
            }
            // Read size
            var size = _readInt64(self._buffer, self._offset);
            self._offset += 8;
            // Read time
            var time = _readInt64(self._buffer, self._offset);
            self._offset += 8;
            // Read value
            var valueSize = size - 8;
            var value = new Buffer(valueSize);
            self._buffer.copy(value, 0, self._offset, self._offset + valueSize);
            self._offset += valueSize;
            return value;
        }

        if (undefined == this._buffer) {
            // Read file contents
            fs.readFile(this._getPath(), function (error, buffer) {
                if (error) {
                    callback(error);
                    return;
                }
                self._buffer = buffer;
                var item = readItem();
                callback(undefined, item);
            });
        } else {
            var item = readItem();
            callback(undefined, item);
        }
    };
    this.nextString = function (callback) {
        this.next(function (error, item) {
            if (undefined != error) {
                callback(error);
                return;
            } else if (undefined == item) {
                callback();
                return;
            }
            item = item.toString();
            callback(undefined, item);
        });
    };
    this.nextNumber = function (callback) {
        this.next(function (error, item) {
            if (undefined != error) {
                callback(error);
                return;
            } else if (undefined == item) {
                callback();
                return;
            }
            item = new Int64(item).toNumber();
            callback(undefined, item);
        });
    };
    // Resets the time line navigation pointer
    this.reset = function () {
        this._offset = 0;
        this._buffer = undefined;
    };
};