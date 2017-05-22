let Exceptions = function() {};
module.exports = new Exceptions();

Exceptions.prototype.error = function(error, message) {
    let finalMessage = message || (error ? error.message : null) || 'UNKNOWN';
    console.log(`[ERROR] ${finalMessage}`);
    console.log(error);
};

Exceptions.prototype.exit = function(code, error, message) {
    this.error(error, message);
    process.exit(code || 1);
}