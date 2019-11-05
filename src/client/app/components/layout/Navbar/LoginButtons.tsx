import React from 'react';
import { Link } from 'react-router-dom';

const LoginButtons: React.FunctionComponent = () => (
    <div className='field is-grouped'>
        <div className='control'>
            <Link
                to='/login'
                className='button is-primary'
                id='loginButton'
            >
                Login
            </Link>
        </div>
        <div className='control'>
            <Link
                to='/signup'
                className='button is-info is-outlined'
                id='signupButton'
            >
                Sign Up
            </Link>
        </div>
    </div>
);

export default LoginButtons;
