import React from 'react';
import { shallow } from 'enzyme';

import ClosableError from './ClosableError';

describe('<ClosableError />', () => {
    it('renders', () => {
        shallow(<ClosableError />);
    });
});
