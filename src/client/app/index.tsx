import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import 'bulma/css/bulma.min.css';

import './index.css';
import App from './App';
import store from './store';

ReactDOM.render(
    (
        <BrowserRouter>
            <App store={store} />
        </BrowserRouter>
    ),
    document.getElementById('root')
);
