import { expect } from 'chai'

import number from './number';

describe('The number validator', () => {
  it('should pass for a number', () => {
    expect(number(123)).to.be.true;
  });

  it('should pass for a string number', () => {
    expect(number('123')).to.be.true;
  });

  it('should fail for alpha', () => {
    expect(number('a')).to.be.false;
  });

  it('should fail for mixed text', () => {
    expect(number('1a')).to.be.false;
  });

  it('should fail for spaced numbers', () => {
    expect(number(' 1 ')).to.be.false;
    expect(number('1 1')).to.be.false;
  });

  it('should pass for null', () => {
    expect(number(null)).to.be.true;
    expect(number('')).to.be.true;
  });
});
