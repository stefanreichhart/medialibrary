let Uuid = function () {
    this.defaultUuidLength = 16;
    this.defaultChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return this;
};
module.exports = new Uuid();

Uuid.prototype.generate = function(length) {
    return Array(length || this.defaultUuidLength).join().split(',').map(() => { 
      return this.defaultChars.charAt(Math.floor(Math.random() * this.defaultChars.length)); 
    }).join('');
};
