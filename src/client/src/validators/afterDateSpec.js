import { expect } from 'chai'

import afterDate from './afterDate';

describe('The before date validator', () => {
  const parentVm = {
    date: '01/11/2001'
  };

  const formatParentVm = {
    date: '01/17'
  }

  it('should determine if a date is after another date', () => {
    expect(afterDate('date')('01/20/2001', parentVm)).to.be.true;
    expect(afterDate('date')('01/11/2003', parentVm)).to.be.true;
  });

  it('should accept a format string', () => {
    expect(afterDate('date', 'MM/YY')('01/18', formatParentVm)).to.be.true;
  });

  it('should return false if a date is not after', () => {
    expect(afterDate('date')('01/10/2001', parentVm)).to.be.false;
  });

  it('should return false for a date with a format string', () => {
    expect(afterDate('date', 'MM/YY')('01/16', formatParentVm)).to.be.false;
  });

  it('should fail for invalid dates', () => {
    expect(afterDate('date')('12/32/2000', parentVm)).to.be.false;
  });
});
