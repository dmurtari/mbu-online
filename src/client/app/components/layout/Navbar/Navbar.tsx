import React from 'react';
import { Link } from 'react-router-dom';

class Navbar extends React.Component {
    render() {
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
                            </span>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }
}

export default Navbar;
