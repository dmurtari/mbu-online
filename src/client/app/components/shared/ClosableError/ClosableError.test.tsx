import React from 'react';
import { shallow } from 'enzyme';

import ClosableError from './ClosableError';

describe('<ClosableError />', () => {
    test('renders', () => {
        shallow(<ClosableError />);
    });

    test('displays a message', () => {
        expect(shallow(<ClosableError message='Hello World' />).text()).toContain('Hello World');
    });

    describe('with an error handler', () => {
        test('shows a close button', () => {
            const spy = jest.fn();
            const wrapper = shallow(<ClosableError messageClosed={spy} />);
            expect(wrapper.find('#closeErrorButton').length).toBe(1);
        });

        test('closes the error', () => {
            const spy = jest.fn();
            const wrapper = shallow(<ClosableError messageClosed={spy} />);

            expect(spy).not.toHaveBeenCalled();

            wrapper.find('#closeErrorButton').simulate('click');

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('without an error handler', () => {
        test('does not have a close button', () => {
            const wrapper = shallow(<ClosableError />);
            expect(wrapper.find('#closeErrorButton').length).toBe(0);
        });
    });
});
