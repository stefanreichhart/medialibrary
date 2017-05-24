let assert = require('assert');

let Merger = exports = module.exports = function() { 
    this.objects = Array.prototype.slice.call(arguments) || [];
    assert(typeof this.objects == 'object' && Array.isArray(this.objects), `Cannot merge objects ${this.objects}`);
    for (let i=0; i<this.objects.length; i++) {
        let object = this.objects[i];
        assert(typeof object == 'object', `Cannot merge object ${object}`);
    }
};

Merger.prototype.get = function() {
    if (this._containsNoObject(this.objects)) {
        return this._mergeArrays(this.objects, []);
    } else {
        return this._mergeObjects(this.objects, {});
    }
};

Merger.prototype._mergeObjects = function(objects, target) {
    for (let i=0; i<objects.length; i++) {
        this._mergeIntoObject(objects[i], target);
    }
    return target;
};

Merger.prototype._mergeArrays = function(objects, target) {
    for (let i=0; i<objects.length; i++) {
        this._mergeIntoArray(objects[i], target);
    }
    return target;
};

Merger.prototype._mergeIntoArray = function(object, target) {
    if (Array.isArray(object)) {
        object.forEach(each => this._mergeIntoArray(each, target));
    } else {
        target.push(object);
    }
};

Merger.prototype._mergeIntoObject = function(object, target) {
    if (typeof object != 'object') {
        throw new Error('Cannot merge objects with non-objects');
    }
    let keys = Object.keys(object);
    for (let i=0; i<keys.length; i++) {
        let key = keys[i];
        let value = object[key];
        let targetValue = target[key];
        if (targetValue === null || targetValue === undefined) {
            target[key] = value;
        } else {
            this._mergeKeyValueIntoObject(key, value, targetValue, target);
        }
    }
};

Merger.prototype._containsNoObject = function(array) {
    for (let i=0; i<array.length; i++) {
        let object = array[i];
        let type = typeof object;
        if (type == 'object' && !Array.isArray(object)) {
            return false;
        }
    }
    return true;
}

Merger.prototype._mergeKeyValueIntoObject = function(key, value, targetValue, target) {
    if (typeof value == 'string' && typeof targetValue == 'string') {
        target[key] = value;
        return;
    }
    if (typeof value == 'number' && typeof targetValue == 'number') {
        target[key] = value;
        return;
    }
    if (typeof value == 'object' && typeof targetValue == 'object') {
        if (Array.isArray(value) && Array.isArray(targetValue)) {
            let newArray = [];
            this._mergeArrays([ targetValue, value ], newArray);
            target[key] = newArray;
            return;
        } else {
            let newObject = {};
            this._mergeObjects([ value, targetValue ], newObject);
            target[key] = newObject;
            return;
        }
    }
    throw new Error('Unsupported Object');
}