import { expect } from 'chai';

import { durationValidator } from './validators';

describe('durationValidator', () => {
    it('should return true for valid period/duration combinations', () => {
        expect(durationValidator([1, 2], 1)).to.equal(true);
        expect(durationValidator([3], 1)).to.equal(true);
        expect(durationValidator([1], 1)).to.equal(true);
        expect(durationValidator([2, 3], 2)).to.equal(true);
        expect(durationValidator([1, 2, 3], 3)).to.equal(true);
    });

    it('should return false for invalid period/duration combinations', () => {
        expect(durationValidator([1, 2, 3], 2)).to.equal(false);
        expect(durationValidator([1, 2], 2)).to.equal(false);
        expect(durationValidator([1, 3], 2)).to.equal(false);
        expect(durationValidator([1, 3], 3)).to.equal(false);
        expect(durationValidator([1], 2)).to.equal(false);
    });
});
