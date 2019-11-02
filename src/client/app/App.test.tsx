import React from 'react';
import { shallow } from 'enzyme';
import { Store, createStore, combineReducers } from 'redux';

import App from './App';

describe('<App />', () => {
    it('renders', () => {
        shallow(<App store={createStore(state => state)} />);
    });
});
