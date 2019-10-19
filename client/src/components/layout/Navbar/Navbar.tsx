import React from 'react';

class Navbar extends React.Component {
    render() {
        return <nav className="navbar has-shadow">
            <div className="container">
                <div className="navbar-brand">
                    <div className="navbar-item">
                        <h5 className="title is-5">MBU Online</h5>
                    </div>
                </div>
                <div className="navbar-menu">
                    <div className="navbar-end">
                        <span className="navbar-item">
                            <div className="field is-grouped">
                                <div className="control">
                                    Login
                                </div>
                                <div className="control">
                                    Sign Up
                                </div>
                            </div>
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    }
}

export default Navbar;