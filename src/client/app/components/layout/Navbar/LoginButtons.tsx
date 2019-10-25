import React from 'react';
import { Link } from 'react-router-dom';

const LoginButtons: React.FunctionComponent = () => {
    return (
        <div className='field is-grouped'>
            <div className='control'>
                <Link
                    to='/login'
                    className='button is-primary'
                >
                    Login
                </Link>
            </div>
            <div className='control'>
                <Link
                    to='/signup'
                    className='button is-info is-outlined'
                >
                    Sign Up
                </Link>
            </div>
        </div>
    )
}

export default LoginButtons;