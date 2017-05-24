let chai = require('chai');
let expect = chai.expect;

let Merger = require('./merger');

let n = function(object) {
    return JSON.stringify(object);
};

describe('merger.get', function() {

    it('new empty instance', function() {
        let merger = new Merger();
        expect(merger.objects).to.have.length(0);
    });

    it('new non-empty instance', function() {
        let merger = new Merger({ a:1 }, { b:2 }, { c:3 });
        expect(merger.objects).to.have.length(3);
    });

    it('invalid arguments', function() {
        expect(() => { new Merger(1, 2, 3) }).to.throw(Error);
        expect(() => { new Merger('1', '2', '3') }).to.throw(Error);
    });

    it('valid arguments', function() {
        expect(() => new Merger({}, {}, {})).to.not.throw(Error);
        expect(() => new Merger({ a:1 }, { b:2 }, { c:3 })).to.not.throw(Error);
        expect(() => new Merger([], [], [])).to.not.throw(Error);
        expect(() => new Merger([1], [2], [3])).to.not.throw(Error);
    });

    it('simple objects', function() {
        let merger = new Merger({ a:1, b:2 }, { c:3 });
        expect(() => merger.get()).to.not.throw(Error);
        expect(n({ a:1, b:2, c:3 })).to.equals(n(merger.get()));
    });

    it('simple arrays', function() {
        let merger = new Merger([1,2], [3,4]);
        expect(() => merger.get()).to.not.throw(Error);
        expect(n([1,2,3,4])).to.equals(n(merger.get()));
    });

    it('complex objects', function() {
        let merger = new Merger({ a:1, b:{ c:{ d:3, g:{ h:0 }, l:{ } } }, e:2, k: [1,2,3] }, { c:3, b:{ c:{ l: { m:1 }, e:4 } }, i:{ j:0 }, k: [4,5,6,7,8] });
        expect(() => merger.get()).to.not.throw(Error);
        expect(n({ a:1, b:{ c:{ d:3, g:{ h:0 }, l:{ m:1 }, e:4 } }, e:2, k: [1,2,3,4,5,6,7,8], c:3, i:{ j:0 } })).to.equals(n(merger.get()));
    });

});