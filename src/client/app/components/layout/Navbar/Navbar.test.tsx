import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import Navbar from './Navbar';
import LoginButtons from './LoginButtons';
import { useSelector } from 'react-redux';

jest.mock('react-redux', () => ({
    useSelector: jest.fn()
}));

describe('<Navbar />', () => {
    let wrapper: ShallowWrapper;

    beforeEach(() => {
        wrapper = shallow(<Navbar />);
    });

    test('renders', () => {
        expect(wrapper).toBeTruthy();
    });

    test('should show a title', () => {
        expect(wrapper.find('#title').text()).toContain('MBU Online');
    });

    describe('when unauthenticated', () => {
        beforeEach(() => {
            (useSelector as jest.Mock).mockImplementation(() => false);
            wrapper = shallow(<Navbar />);
        });

        test('should show login buttons', () => {
            expect(wrapper.find(LoginButtons).length).toBe(1);
        });
    });

    describe('when authenticated', () => {
        beforeEach(() => {
            (useSelector as jest.Mock).mockImplementation(() => true);
            wrapper = shallow(<Navbar />);
        });

        test('should hide login buttons when authenticated', () => {
            expect(wrapper.find(LoginButtons).length).toBe(0);
        });
    });
});
