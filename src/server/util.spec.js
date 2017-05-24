let chai = require('chai');
let expect = chai.expect;

let util = require('./util');

describe('util.normalizeText', function() {

  it('trim at the start', function() {
    expect(util.normalizeText(' abc')).to.equal('abc');
  });

  it('trim at the end', function() {
    expect(util.normalizeText('abc ')).to.equal('abc');
  });

  it('trim both', function() {
    expect(util.normalizeText(' abc ')).to.equal('abc');
  });

  it('trim single blank', function() {
    expect(util.normalizeText(' ')).to.equal('');
  });

  it('trim all blanks', function() {
    expect(util.normalizeText('     ')).to.equal('');
  });

  it('null becomes empty string', function() {
    expect(util.normalizeText(null)).to.equal('');
  });

  it('undefined becomes empty string', function() {
    expect(util.normalizeText(undefined)).to.equal('');
  });

});

describe('util.normalizeParameter', function() {

  it('lowercase stays lowercase', function() {
    expect(util.normalizeParameter('abc')).to.equal('abc');
  });

  it('uppercase becomes lowercase', function() {
    expect(util.normalizeParameter('ABC')).to.equal('abc');
  });

  it('anycase becomes lowercase', function() {
    expect(util.normalizeParameter('AbC')).to.equal('abc');
  });

  it('inbetween spaces become +', function() {
    expect(util.normalizeParameter(' a b c ')).to.equal('a+b+c');
  });

  it('compact multiple spaces', function() {
    expect(util.normalizeParameter(' a  b  c ')).to.equal('a+b+c');
    expect(util.normalizeParameter('  a  b  c  ')).to.equal('a+b+c');
  });

});

describe('util.containsByIdentity', function() {
  
  it('contained', function() {
    expect(util.containsByIdentity([ 'a', 'b', 'c' ], 'c'));
    expect(util.containsByIdentity([ 1, 'b', 'c' ], 1));
    let object = { a: 'a' };
    expect(util.containsByIdentity([ 1, object, 'c', [], {} ], object));
  });

/*
  it('not contained', function() {
    expect(util.containsByIdentity([ 'a', 'b', 'c' ], 'c')).to.be.false;
    expect(util.containsByIdentity([ 'a', 'b', 'C' ], 'c')).to.be.false;
    expect(util.containsByIdentity([ '1', '2', 3 ], 1)).to.be.false;
    expect(util.containsByIdentity([ '1', '2', '3' ], '3')).to.be.false;
    let object1 = { a: '1' };
    let object1b = { a: '1' };
    let object2 = { a: 1 };
    expect(util.containsByIdentity([ 1, object1, 'c', [], {} ], object2)).to.be.false;
    expect(util.containsByIdentity([ 1, object2, 'c', [], {} ], object1)).to.be.false;
    expect(util.containsByIdentity([ 1, object1b, 'c', [], {} ], object1)).to.be.false;
    expect(util.containsByIdentity([ 1, object1, 'c', [], {} ], object1b)).to.be.false;
  });
*/
});

describe('util.containsByEquality', function() {
  
  it('contained', function() {
    expect(util.containsByEquality([ 'a', 'b', 'c' ], 'c'));
    expect(util.containsByEquality([ 1, 'b', 'c' ], 1));
    let object = { a: 'a' };
    expect(util.containsByEquality([ 1, object, 'c', [], {} ], object));
    expect(util.containsByEquality([ 'a', 'b', 'c' ], 'c'));
    expect(util.containsByEquality([ '1', '2', 3 ], 1));
    expect(util.containsByEquality([ '1', '2', '3' ], '3'));
  });

  it('not contained', function() {
    expect(util.containsByEquality([ 'a', 'b', 'C' ], 'c')).to.be.false;
    let object1 = { a: '1' };
    let object1b = { a: '1' };
    let object2 = { a: 1 };
    expect(util.containsByEquality([ 1, object1, 'c', [], {} ], object2)).to.be.false;
    expect(util.containsByEquality([ 1, object2, 'c', [], {} ], object1)).to.be.false;
    expect(util.containsByEquality([ 1, object1b, 'c', [], {} ], object1)).to.be.false;
    expect(util.containsByIdentity([ 1, object1, 'c', [], {} ], object1b)).to.be.false;
  });

});