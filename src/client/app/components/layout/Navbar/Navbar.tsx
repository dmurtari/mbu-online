import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { getAuthenticationStatus } from '@store/authentication/selectors';
import { IAuthenticationState } from '@store/authentication/reducers';
import { IApplicationState } from '@store/index';
import LoginButtons from './LoginButtons';

interface IProps {
    isAuthenticated: IAuthenticationState['authenticated'];
}   

const Navbar: React.FunctionComponent<IProps> = (props: IProps) => {
    return (
        <nav className='navbar has-shadow'>
            <div className='container'>
                <div className='navbar-brand'>
                    <div className='navbar-item'>
                        <Link to='/'>
                            <h5 className='title is-5'>MBU Online</h5>
                        </Link>
                    </div>
                </div>
                <div className='navbar-menu'>
                    <div className='navbar-end'>
                        <span className='navbar-item'>
                            {props.isAuthenticated ? null : <LoginButtons />}                                    
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
}

const mapStateToProps = (state: IApplicationState) => ({ isAuthenticated: getAuthenticationStatus(state) })

export default connect(mapStateToProps)(Navbar);