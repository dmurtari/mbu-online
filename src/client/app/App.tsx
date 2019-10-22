import { hot } from 'react-hot-loader/root';
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Store } from 'redux';

import './App.css';
import Navbar from './components/layout/Navbar/Navbar';
import Login from './components/authentication/Login/Login';

interface MyProps {
    store: Store;
}

const App: React.FC<MyProps> = ({ store }) => (
    <Provider store={store}>
        <Navbar />
        <div className='container'>
            <Switch>
                <Route path='/login'>
                    <Login />
                </Route>
            </Switch>
        </div>
    </Provider>
);

export default hot(App);
