let assert = require('assert');

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

Assert.prototype.equals = function(expected, actual) {
    assert(expected === actual || expected == actual);
};