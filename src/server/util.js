let Util = function() {};
module.exports = new Util();

Util.prototype.normalizeText = function(text) {
    return ('' + (text || '')).trim();
};

Util.prototype.normalizeParameter = function(text) {
    return this.normalizeText(text).replace(/ /g, '+').toLowerCase();
};