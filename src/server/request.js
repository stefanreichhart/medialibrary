let assert = require('./assert');

let Request = function() { };
module.exports = new Request();

Request.prototype.get = function(router, url, callback) {
    this._handleMethod(router, 'GET', url, callback);
};

Request.prototype.put = function(router, url, callback) {
    this._handleMethod(router, 'PUT', url, callback);
};

Request.prototype.post = function(router, url, callback) {
    this._handleMethod(router, 'POST', url, callback);
};

Request.prototype.delete = function(router, url, callback) {
    this._handleMethod(router, 'DELETE', url, callback);
};

Request.prototype._handleMethod = function(router, method, url, callback) {
    var self = this;
    try {
        assert.defined(url);
        assert.equals('function', typeof callback);
        router.get(url, (request, response) => {
            self._handleRequest(request, response, method, url, callback);
        });
    } catch (error) {
        self._handleError({}, error, `Setting up route ${method} ${url}`);
    }
};

Request.prototype._handleRequest = function(request, response, method, url, callback) {
    let resolve = function(answer) {
        response.json(answer);
    };
    let reject = function(answer) {
        response.status(500).json(answer);
    };
    try {
        callback(request, response, resolve, reject);
    } catch (error) {
        this._handleError({}, error, `Handling request ${method} ${url}`);
        reject({});
    }
};

Request.prototype._handleError = function(answer, error, message) {
    let finalAnswer = Object.assign({}, answer || {}, { message: message || '', error: (error ? error.message : null) || 'UNKNOWN' });
    console.log(`[ERROR] ${message}`);
    console.log(finalAnswer);
    console.log(error);
};
