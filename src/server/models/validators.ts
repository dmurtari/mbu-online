import { isEqual } from 'lodash';

export function durationValidator(periods: number[], duration: number): boolean {
    if (duration === 2) {
        return isEqual(periods.sort(), [2, 3]);
    }

    if (duration === 3) {
        return isEqual(periods.sort(), [1, 2, 3]);
    }

    return true;
}
