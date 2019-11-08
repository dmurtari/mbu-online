import { expect } from 'chai'

import beforeDate from './beforeDate';

describe('The before date validator', () => {
  const parentVm = {
    date: '01/11/2001'
  };

  const formatParentVm = {
    date: '01/17'
  }

  it('should determine if a date is before another date', () => {
    expect(beforeDate('date')('01/10/2001', parentVm)).to.be.true;
    expect(beforeDate('date')('01/11/2000', parentVm)).to.be.true;
  });

  it('should accept a format string', () => {
    expect(beforeDate('date', 'MM/YY')('01/16', formatParentVm)).to.be.true;
  });

  it('should return false if a date is not before', () => {
    expect(beforeDate('date')('01/13/2001', parentVm)).to.be.false;
  });

  it('should return false for a date with a format string', () => {
    expect(beforeDate('date', 'MM/YY')('01/18', formatParentVm)).to.be.false;
  });

  it('should fail for invalid dates', () => {
    expect(beforeDate('date')('01/32/2001', parentVm)).to.be.false;
  })
});
