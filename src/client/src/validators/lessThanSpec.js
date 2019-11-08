import { expect } from 'chai'

import lessThan from './lessThan';

describe('The less than validator', () => {
  const parentVm = {
    number: 12
  };

  const emptyParentVm = {};

  it('should determine if something is less than a number', () => {
    expect(lessThan('number')(10, parentVm)).to.be.true;
    expect(lessThan('number')(-10, parentVm)).to.be.true;
  });

  it('should fail if the number is greater', () => {
    expect(lessThan('number')(13, parentVm)).to.be.false;
  });

  it('should pass if the number is equal', () => {
    expect(lessThan('number')(12, parentVm)).to.be.true;
  });

  it('should pass if there is nothing to compare to', () => {
    expect(lessThan('number')(13, emptyParentVm)).to.be.true;
  });

  it('should pass if nothing is passed in', () => {
    expect(lessThan('number')('', parentVm)).to.be.true;
  });
});
