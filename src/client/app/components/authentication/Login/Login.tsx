import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { Formik, FormikActions, Form, Field, ErrorMessage } from 'formik';
import { object, string } from 'yup';

import './Login.css';
import { login } from '@store/authentication/actions';
import ClosableError from '@components/shared/ClosableError/ClosableError';

interface IState {
    email?: string;
    password?: string;
    error?: string | null;
}

interface IProps {
    login: any;
}

const signupSchema = object().shape({
    email: string()
        .email('Please enter a valid email address')
        .required('Please enter your email address'),
    password: string()
        .required('Please enter your password') 
});

class Login extends React.Component<IProps & RouteComponentProps, IState> {
    constructor(props: IProps & RouteComponentProps) {
        super(props);

        this.state = {}
    }

    submitLogin = (values: Readonly<IState>, actions: FormikActions<Readonly<IState>>): void => {
        this.props.login(values)
            .then(() => {
                this.props.history.push('/');
            })
            .catch(() => {
                this.setState({
                    error: 'Unable to log you in. Please check your credentials and try again.'
                });
            })
            .then(() => {
                actions.setSubmitting(false);
            });
    }

    render() {
        return (
            <div className='column is-three-quarters is-offset-2'>
                <h1 className='title'>Login</h1>
                <h3 className='subtitle'>Welcome back to MBU Online!</h3>
                {
                    this.state.error &&
                    <ClosableError 
                        message={this.state.error}
                        messageClosed={() => this.setState({ error: null })}
                    />
                }
                <Formik
                    initialValues={{ email: '', password: '' }}
                    onSubmit={this.submitLogin}
                    validationSchema={signupSchema}
                    validateOnBlur={true}
                >
                    {({
                        isSubmitting,
                        errors,
                        touched,
                        error
                    }) => (
                        <Form>
                            <div className='field'>
                                <label
                                    htmlFor='email'
                                    className='label'
                                >   
                                    Email
                                </label>
                                <div className='control'>
                                    <Field
                                        type='email'
                                        name='email'
                                        className={`input is-expanded ${touched.email && errors.email && 'is-danger'}`}
                                        placeholder='Enter your email'
                                    />
                                </div>
                                <ErrorMessage
                                    name='email'
                                    component='span'
                                    className='help is-danger' />
                            </div>
                            <div className='field'>
                                <label
                                    htmlFor='password'
                                    className='label'
                                >
                                    Password
                                </label>
                                <div className='control'>
                                    <Field
                                        type='password'
                                        name='password'
                                        className={`input is-expanded ${touched.password && errors.password && 'is-danger'}`}
                                        placeholder='Password' 
                                    />
                                </div>
                                <ErrorMessage
                                    name='password'
                                    component='span'
                                    className='help is-danger' />
                            </div>
                            <div className='field is-grouped button-bar'>
                                <div className='control'>
                                    <button
                                        type='submit'
                                        className={`button is-primary ${isSubmitting ? 'is-loading' : ''}`}
                                        disabled={isSubmitting}
                                    >
                                        Login
                                    </button>
                                </div>
                                <div className='control'>
                                    <button
                                        type='button'
                                        className='button is-info is-outlined'
                                        disabled={isSubmitting}
                                        onClick={() => this.props.history.push('/signup')}
                                    >
                                        Create an account
                                    </button>
                                </div>
                                <div className='control reset-control'>
                                    <button
                                        type='button'
                                        className='button is-text'
                                        disabled={isSubmitting || error}
                                        onClick={() => this.props.history.push('/reset')}
                                    >
                                        Create an account
                                    </button>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        );
    }
}

const mapDispatchToProps = { login };

export default connect(null, mapDispatchToProps)(withRouter(Login));