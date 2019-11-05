import React from 'react';

interface IProps {
    message?: string;
    messageClosed?: Function;
}

const ClosableError: React.FunctionComponent<IProps> = (props: IProps) => {
    function closeMessage(): void {
        props.messageClosed && props.messageClosed();
    }

    return (
        <div
            className='notification is-warning'
        >
            {
                props.messageClosed &&
                (
                    <button
                        className='delete'
                        onClick={closeMessage}
                        id='closeErrorButton'
                    />
                )
            }
            <p>{props.message}</p>
        </div>
    );
};

export default ClosableError;
