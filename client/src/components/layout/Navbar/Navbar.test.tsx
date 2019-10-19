import React from 'react';
import ReactDOM from 'react-dom';

import Navbar from './Navbar';

it('renders', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Navbar />, div);
    ReactDOM.unmountComponentAtNode(div);
})