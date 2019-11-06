import { hot } from 'react-hot-loader/root';
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Store } from 'redux';

import './App.css';
import Navbar from './components/layout/Navbar/Navbar';
import Login from './components/authentication/Login/Login';
import ResetContainer from '@components/authentication/Reset/ResetContainer';

interface IProps {
    store: Store;
}

const App: React.FC<IProps> = ({ store }) => (
    <Provider store={store}>
        <Navbar />
        <div className='container'>
            <Switch>
                <Route path='/login'>
                    <Login />
                </Route>
                <Route path='/reset'>
                    <ResetContainer />
                </Route>
            </Switch>
        </div>
    </Provider>
);

export default hot(App);
