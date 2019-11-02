import React from 'react';
import { shallow } from 'enzyme';

import LoginButtons from './LoginButtons';

describe('<LoginButtons />', () => {
    it('renders', () => {
        shallow(<LoginButtons />);
    });
});
