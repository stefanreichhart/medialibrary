let assert = require('assert');
let util = require('./util');

let Assert = function() {};
module.exports = new Assert();

Assert.prototype.notDefined = function(value, message) {
    assert(value === null || value === undefined, message);
};

Assert.prototype.defined = function(value, message) {
    assert(value !== null && value !== undefined, message);
};

Assert.prototype.notEmpty = function(value, message) {
    this.defined(value);
    assert(value != '' && value.trim() != '', message);
};

Assert.prototype.identical = function(expected, actual, message) {
    assert(expected === actual, message);
};

Assert.prototype.equals = function(expected, actual, message) {
    assert(expected === actual || expected == actual, message);
};

Assert.prototype.array = function(value, message) {
    assert(typeof value == 'object' && Array.isArray(value), message);
};

Assert.prototype.any = function(expected, actual, message) {
    assert(typeof expected == 'object', 'Invalid use of any; expected must be of type array');
    assert(util.containsByEquality(expected, actual) == true, message);
};

Assert.prototype.none = function(expected, actual, message) {
    assert(typeof expected == 'object', 'Invalid use of any; expected must be of type array');
    assert(util.containsByEquality(expected, actual) == false, message);
};