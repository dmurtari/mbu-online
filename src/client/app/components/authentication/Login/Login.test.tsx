import React from 'react';
import { shallow } from 'enzyme';

import Login from './Login';

jest.mock('react-redux', () => ({
    useDispatch: jest.fn()
}));

describe('<Login />', () => {
    it('renders', () => {
        shallow(<Login />);
    });

});
