import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { getAuthenticationStatus } from '@store/authentication/selectors';
import LoginButtons from './LoginButtons';

const Navbar: React.FunctionComponent = () => {
    const isAuthenticated = useSelector(getAuthenticationStatus);

    return (
        <nav className='navbar has-shadow'>
            <div className='container'>
                <div className='navbar-brand'>
                    <div className='navbar-item'>
                        <Link
                            to='/'
                            id='title'
                        >
                            <h5 className='title is-5'>MBU Online</h5>
                        </Link>
                    </div>
                </div>
                <div className='navbar-menu'>
                    <div className='navbar-end'>
                        <span className='navbar-item'>
                            {isAuthenticated ? null : <LoginButtons />}
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
