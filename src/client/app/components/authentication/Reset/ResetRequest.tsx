import React, { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

import './ResetRequest.css';
import ClosableError from '@components/shared/ClosableError/ClosableError';

interface IResetRequest {
    email: string;
}

const ResetRequestSchema = Yup.object().shape({
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Please enter your email address')
});

const ResetRequest: React.FunctionComponent = () => {
    const [error, setError] = useState<null | string>(null);
    const [sentStatus, setSentStatus] = useState<boolean>(false);

    function clearError(): void {
        setError(null);
    }

    function submitForm(values: IResetRequest): Promise<void> {
        return axios.post(`/api/forgot`, values)
            .then(() => {
                setSentStatus(true);
                setError(null);
            })
            .catch(() => {
                setError('There was a problem sending the email. Please try again later.');
            });
    }

    return (
        <div>
            <div className='reset-help'>
                A link to reset your password will be emailed to you from no&#8209;reply@apo&#8209;gammatheta.org.
                Please check your spam folder if you do not see this email.
            </div>
            {
                error &&
                (
                    <ClosableError
                        message={error}
                        messageClosed={clearError}
                    />
                )
            }
            {
                sentStatus &&
                (
                    <div className='notification is-success'>
                        Successfully sent the reset email! Check your inbox and click the link in the message.
                    </div>
                )
            }
            <Formik
                initialValues={{
                    email: ''
                } as IResetRequest}
                onSubmit={submitForm}
                validationSchema={ResetRequestSchema}
            >
                {({
                    isSubmitting,
                    errors,
                    touched
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
                        <div className='field is-grouped button-bar'>
                            <div className='control'>
                                <button
                                    type='submit'
                                    className={`button is-primary ${isSubmitting ? 'is-loading' : ''}`}
                                    disabled={isSubmitting}
                                >
                                    {sentStatus ? 'Resend Email' : 'Send Email'}
                                </button>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ResetRequest;

