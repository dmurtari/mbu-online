import { expect } from 'chai'

import betweenDate from './betweenDate';

describe('The between date validator', () => {
  const parentVm = {
    firstDate: '01/01/2001',
    secondDate: '01/01/2002'
  };

  const formatParentVm = {
    firstDate: '01/02',
    secondDate: '01/04'
  }

  it('should determine if a date is between two other dates', () => {
    expect(betweenDate('firstDate', 'secondDate')('01/12/2001', parentVm)).to.be.true;
  });

  it('should accept a format string', () => {
    expect(betweenDate('firstDate', 'secondDate', 'MM/YY')('01/03', formatParentVm)).to.be.true;
  });

  it('should return false if a date is not between', () => {
    expect(betweenDate('firstDate', 'secondDate')('01/14/2002', parentVm)).to.be.false;
  });

  it('should return false for a date with a format string', () => {
    expect(betweenDate('firstDate', 'secondDate', 'MM/YY')('12/16', formatParentVm)).to.be.false;
  });

  it('should not care about order for the surrounding dates', () => {
    expect(betweenDate('firstDate', 'secondDate')('01/12/2001', parentVm)).to.be.true;
    expect(betweenDate('secondDate', 'firstDate')('01/12/2001', parentVm)).to.be.true;
  });

  it('should fail for invalid dates', () => {
    expect(betweenDate('firstDate', 'secondDate')('01/32/2001', parentVm)).to.be.false;
  })
});
