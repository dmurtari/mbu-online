import React from 'react';
import { Switch, Route } from 'react-router';

import './ResetContainer.css';
import ResetRequest from '@components/authentication/Reset/ResetRequest';

const ResetContainer: React.FunctionComponent = () => {
    return (
        <div className='column is-three-quarters is-offset-2 ResetContainer'>
            <h1 className='title'>Reset your Password</h1>
            <Switch>
                <Route path='/'>
                    <ResetRequest />
                </Route>
            </Switch>
        </div>
    );
};

export default ResetContainer;
