let chai = require('chai');
let expect = chai.expect;

let uuid = require('./uuid');

describe('uuid.generate', function() {

    it('no exception', function() {
        expect(() => uuid.generate()).to.not.throw(Error);
    });

    it('default length length', function() {
        expect(uuid.defaultUuidLength).to.be.equal(uuid.generate().length);
    });

    it('length', function() {
        expect(8).to.be.equal(uuid.generate(8).length);
        expect(11).to.be.equal(uuid.generate(11).length);
        expect(32).to.be.equal(uuid.generate(32).length);
        expect(512).to.be.equal(uuid.generate(512).length);
    });

});
