import React, { useState } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import './Login.css';
import { login } from '@store/authentication/actions';
import ClosableError from '@components/shared/ClosableError/ClosableError';

interface IProps {
    login: any;
}

const SignupSchema = Yup.object().shape({
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Please enter your email address'),
    password: Yup.string()
        .required('Please enter your password') 
});

const Login: React.FunctionComponent<IProps & RouteComponentProps> = (props) => {
    const [error, setError] = useState<null | string>(null);

    return (
        <div className='column is-three-quarters is-offset-2'>
            <h1 className='title'>Login</h1>
            <h3 className='subtitle'>Welcome back to MBU Online!</h3>
            {
                error &&
                <ClosableError 
                    message={error}
                    messageClosed={() => setError(null)}
                />
            }
            <Formik
                initialValues={{
                    email: '', 
                    password: '' 
                }}
                validationSchema={SignupSchema}
                onSubmit={(values, actions) => {
                    props.login(values)
                        .then(() => {
                            props.history.push('/');
                        })
                        .catch(() => {
                            setError('Unable to log you in. Please check your credentials and try again.');
                        })
                        .then(() => {
                            actions.setSubmitting(false);
                        });
                }}
            >
                {({
                    isSubmitting,
                    errors,
                    touched,
                    handleSubmit
                }) => (
                    <form onSubmit={handleSubmit}>
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
                                    onClick={() => props.history.push('/signup')}
                                >
                                    Create an account
                                </button>
                            </div>
                            <div className='control reset-control'>
                                <button
                                    type='button'
                                    className='button is-text'
                                    disabled={isSubmitting}
                                    onClick={() => props.history.push('/reset')}
                                >
                                    Create an account
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </Formik>
        </div>
    );
}

const mapDispatchToProps = { login };

export default connect(null, mapDispatchToProps)(withRouter(Login));