import { expect } from 'chai'

import date from './date';

describe('The date validator', () => {
  it('should validate a date', () => {
    expect(date()('01/11/2001')).to.be.true;
    expect(date()('02/21/2001')).to.be.true;
  });

  it('should not validate a bad date', () => {
    expect(date()('00/00/0000')).to.be.false;
    expect(date()('02/30/2000')).to.be.false;
    expect(date()('13/20/2001')).to.be.false;
  });

  it('should allow a custom format', () => {
    expect(date('DD/MM/YYYY')('23/01/2001')).to.be.true;
    expect(date('DD/MM/YYYY')('23/23/2001')).to.be.false;
    expect(date('YY/MM/DD')('17/01/31')).to.be.true;
    expect(date('YY/MM/DD')('17/28/20')).to.be.false;
  });

  it('should enforce format strictly', () => {
    expect(date()('1/11/2001')).to.be.false;
    expect(date()('01/__/____')).to.be.false;
  });
});
