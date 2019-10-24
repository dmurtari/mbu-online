import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import './Login.css';
import { login } from '@store/authentication/actions';

interface IState {
    email?: string;
    password?: string;
}

interface IProps {
    login: any;
}

class Login extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            email: '',
            password: ''
        };
    }

    handleInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit = () => {
        this.props.login();
    }

    render() {
        return (
            <div className='column is-three-quarters is-offset-2'>
                <h1 className='title'>Login</h1>
                <h3 className='subtitle'>Welcome back to MBU Online!</h3>
                <form>
                    <div className='field'>
                        <label
                            htmlFor='email'
                            className='label'
                        >
                            Email
                        </label>
                        <div className='control'>
                            <input
                                type='email'
                                name='email'
                                className='input is-expanded'
                                placeholder='Enter your email'
                                value={this.state.email}
                                onChange={this.handleInputChange}
                            />
                        </div>
                    </div>
                    <div className='field'>
                        <label
                            htmlFor='password'
                            className='label'
                        >
                            Password
                        </label>
                        <div className='control'>
                            <input
                                type='password'
                                name='password'
                                className='input is-expanded'
                                placeholder='Password'
                                value={this.state.password}
                                onChange={this.handleInputChange}
                            />
                        </div>
                    </div>
                    <div className='field is-grouped button-bar'>
                        <div className='control'>
                            <button 
                                type='button'
                                className='button is-primary'
                                onClick={this.handleSubmit}
                            >
                                Login
                            </button>
                        </div>
                        <div className='control'>
                            <Link
                                to='/signup'
                                className='button is-info is-outlined'
                            >
                                Create an Account
                            </Link>
                        </div>
                        <div className='control reset-control'>
                            <Link
                                to='/reset'
                                className='button is-text'
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

const mapDispatchToProps = { login };

export default connect(null, mapDispatchToProps)(Login);