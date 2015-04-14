var fs = require('fs');
var SchemaClass = require('./schema');
// Represents a persistent storage containing all time line entities
module.exports = function (path) {
    // Path to the given storage
    this._path = path;
    // Creates a new schema in the current storage
    this.create = function (schemaName, callback) {
        var path = this._path + '/' + schemaName;
        fs.mkdir(path, function (error) {
            if (!error || (error && error.code === 'EEXIST')) {
                callback();
            } else {
                callback(error);
            }
        });
    };
    // Lists all storage schemas
    this.list = function (callback) {
        var self = this;
        fs.readdir(this._path, function (error, fileNames) {
            if (undefined != error) {
                callback(error);
                return;
            }
            var schemas = [];
            for (var i = 0; i < fileNames.length; i++) {
                var fileName = fileNames[i];
                var schema = new SchemaClass(self, fileName);
                schemas.push(schema);
            }
            callback(undefined, schemas);
        });
    };
    // Gets a schema from the current storage specified by the schema name
    this.get = function (schemaName) {
        var schema = new SchemaClass(this, schemaName);
        return schema;
    };
};