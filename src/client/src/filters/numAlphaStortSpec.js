import { expect } from 'chai'

import numAlphaSort from './numAlphaSort';

describe('Sorting numbers followed by a letter', () => {
  it('should sort an array of numbers', () => {
    expect(numAlphaSort(['1', '5', '3'])).to.deep.equal(['1', '3', '5']);
  });

  it('should sort double digit numbers', () => {
    expect(numAlphaSort(['10', '1', '2'])).to.deep.equal(['1', '2', '10']);
  });

  it('should sort elements with a trailing letter', () => {
    expect(numAlphaSort(['1a', '2b', '2a'])).to.deep.equal(['1a', '2a', '2b']);
  });

  it('should not care about case', () => {
    expect(numAlphaSort(['1B', '1a', '2a', '2B'])).to.deep.equal(['1a', '1B', '2a', '2B']);
  });

  it('should allow mixed elements', () => {
    expect(numAlphaSort(['1a', '3b', '11a', '10', '2'])).to.deep.equal(['1a', '2', '3b', '10', '11a']);
  });

  it('should protect against null values', () => {
    expect(numAlphaSort(['1', null])).to.deep.equal(['1']);
  });

  it('should protect against undefined values', () => {
    expect(numAlphaSort(['1', undefined])).to.deep.equal(['1']);
  });
});
