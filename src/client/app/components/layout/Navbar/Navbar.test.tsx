import React from 'react';
import { shallow } from 'enzyme';

import Navbar from './Navbar';

jest.mock('react-redux', () => ({
    useSelector: () => ({
        getAuthenticationStatus: false
    })
}));

describe('<Navbar />', () => {
    it('renders', () => {
        shallow(<Navbar />);
    });
});
