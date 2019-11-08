import { expect } from 'chai'

import commaSeparated from './commaSeparated';

describe('The comma separated validator', () => {
  it('should validate a comma separated list', () => {
    expect(commaSeparated('1, 2, 3')).to.be.true;
    expect(commaSeparated('1,2,3')).to.be.true;
    expect(commaSeparated('1, 2,3')).to.be.true;
    expect(commaSeparated('1a, 2, 3b')).to.be.true;
    expect(commaSeparated('1a, 2, a')).to.be.true;
  });

  it('should accept ending with a comma', () => {
    expect(commaSeparated('1,2,3,')).to.be.true;
  })

  it('should fail for other punctuation', () => {
    expect(commaSeparated('1.2.3')).to.be.false;
    expect(commaSeparated('1,2.3')).to.be.false;
  });

  it('should pass for empty values', () => {
    expect(commaSeparated(null)).to.be.true;
    expect(commaSeparated('')).to.be.true;
    expect(commaSeparated(' ')).to.be.true;
  });
});
