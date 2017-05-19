let assert = require('assert');

let Assert = function() {};

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

module.exports = new Assert();