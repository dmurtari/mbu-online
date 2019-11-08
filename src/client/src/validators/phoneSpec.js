import { expect } from 'chai'

import phone from './phone';

describe('The phone validator', () => {
  it('should validate a formatted phone number', () => {
    expect(phone('(123) 456-7890')).to.be.true;
    expect(phone('(123)456-7890')).to.be.true;
  });

  it('should fail for unformatted numbers', () => {
    expect(phone('123-456-7890')).to.be.false;
    expect(phone('1234567890')).to.be.false;
    expect(phone('(123) 45-6789')).to.be.false;
    expect(phone('(123) 456-789')).to.be.false;
    expect(phone('(123) 45-67890')).to.be.false;
    expect(phone('(123) 4567-890')).to.be.false;
  });
});
