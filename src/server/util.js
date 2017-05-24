let Util = function() {};
module.exports = new Util();

Util.prototype.normalizeText = function(text) {
    return ('' + (text || '')).trim();
};

Util.prototype.normalizeParameter = function(text) {
    return this.normalizeText(text).replace(/( )+/g, '+').toLowerCase();
};

Util.prototype.containsByIdentity = function(array, object) {
    for (let i = 0; i<array.length; i++) {
        let each = array[i];
        if (each === object) {
            return true;
        }
    }
    return false;
}

Util.prototype.containsByEquality = function(array, object) {
    for (let i = 0; i<array.length; i++) {
        let each = array[i];
        if (each === object || each == object) {
            return true;
        }
    }
    return false;
}