import { expect } from 'chai'

import greaterThan from './greaterThan';

describe('The less than validator', () => {
  const parentVm = {
    number: 12
  };

  const emptyParentVm = {};

  it('should determine if something is greater than a number', () => {
    expect(greaterThan('number')(13, parentVm)).to.be.true;
    expect(greaterThan('number')(14, parentVm)).to.be.true;
  });

  it('should fail if the number is less', () => {
    expect(greaterThan('number')(11, parentVm)).to.be.false;
  });

  it('should pass if the number is equal', () => {
    expect(greaterThan('number')(12, parentVm)).to.be.true;
  });

  it('should pass if there is nothing to compare to', () => {
    expect(greaterThan('number')(11, emptyParentVm)).to.be.true;
  });

  it('should pass if nothing is passed in', () => {
    expect(greaterThan('number')('', parentVm)).to.be.true;
  });
});
