import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Store } from 'redux';

import './App.css';
import Navbar from './components/layout/Navbar/Navbar';

interface MyProps {
    store: Store;
}

const App: React.FC<MyProps> = ({ store }) => (
    <Provider store={store}>
        <Navbar></Navbar>
        <Router>
        </Router>
    </Provider>
)

export default App;
