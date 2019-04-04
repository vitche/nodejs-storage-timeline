var async = require('async');
var baseTest = require('../base-test');
var storageTimeline = require('../main');
exports.tearDown = baseTest.deleteTimeLines;
exports.testChinese = function (test) {
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
			var value = '蟒蛇瞬.1';
			timeLine.add(value, function () {
				timeLine.copy('timeline-0.copy', function (error, timeLineCopy) {
					timeLineCopy.nextString(function (error, item) {
						if (item.value !== value) {
							test.fail();
						}
						test.done();
					});
				});
			});
		});
	});
};
exports.testEnglish = function (test) {
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
			var value = 'TEST.1';
			timeLine.add(value, function () {
				timeLine.copy('timeline-0.copy', function (error, timeLineCopy) {
					timeLineCopy.nextString(function (error, item) {
						if (item.value !== value) {
							test.fail();
						}
						test.done();
					});
				});
			});
		});
	});
};
exports.testRussian = function (test) {
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
			var value = 'ТЕСТ.1';
			timeLine.add(value, function () {
				timeLine.copy('timeline-0.copy', function (error, timeLineCopy) {
					timeLineCopy.nextString(function (error, item) {
						if (item.value !== value) {
							test.fail();
						}
						test.done();
					});
				});
			});
		});
	});
};