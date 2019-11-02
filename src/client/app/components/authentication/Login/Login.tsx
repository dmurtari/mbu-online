import React, { useState } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Formik, Field, ErrorMessage, Form } from 'formik';
import * as Yup from 'yup';

import { createLogin } from '@store/authentication/actions';
import ClosableError from '@components/shared/ClosableError/ClosableError';

import './Login.css';

interface ILoginRequest {
    email: string;
    password: string;
}

const SignupSchema = Yup.object().shape({
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Please enter your email address'),
    password: Yup.string()
        .required('Please enter your password')
});

const Login: React.FunctionComponent<RouteComponentProps> = (props) => {
    const [error, setError] = useState<null | string>(null);
    const dispatch = useDispatch();

    const loginRequest = bindActionCreators(
        {
            submit: createLogin
        },
        dispatch
    );

    function clearError(): void {
        setError(null);
    }

    function submitForm(values: ILoginRequest): Promise<void> {
        return loginRequest.submit(values)
            .then(() => {
                props.history.push('/');
            })
            .catch(() => {
                setError('Unable to log you in. Please check your credentials and try again.');
            });
    }

    return (
        <div className='column is-three-quarters is-offset-2 Login'>
            <h1 className='title'>Login</h1>
            <h3 className='subtitle'>Welcome back to MBU Online!</h3>
            {
                error &&
                (
                    <ClosableError
                        message={error}
                        messageClosed={clearError}
                    />
                )
            }
            <Formik
                initialValues={{
                    email: '',
                    password: ''
                } as ILoginRequest}
                validationSchema={SignupSchema}
                onSubmit={submitForm}
            >
                {({
                    isSubmitting,
                    errors,
                    touched,
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
                                className='help is-danger'
                            />
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
                                className='help is-danger'
                            />
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
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default withRouter(Login);
