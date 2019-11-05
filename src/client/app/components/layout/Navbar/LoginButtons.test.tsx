import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import LoginButtons from './LoginButtons';

describe('<LoginButtons />', () => {
    let wrapper: ShallowWrapper;

    beforeEach(() => {
        wrapper = shallow(<LoginButtons />);
    });

    test('renders', () => {
        expect(wrapper).toBeTruthy();
    });

    test('has a login button', () => {
        expect(wrapper.find('#loginButton').text()).toContain('Login');
    });

    test('has a signup button', () => {
        expect(wrapper.find('#signupButton').text()).toContain('Sign Up');
    });
});
