import React from 'react';

interface IProps {
    message?: string;
    messageClosed?: Function;
}

const ClosableError: React.SFC<IProps> = (props: IProps) => {
    return (
        <div 
            className='notification is-warning'
        >
            {
                props.messageClosed &&
                <button
                    className='delete'
                    onClick={() => props.messageClosed && props.messageClosed()}
                ></button>
            }
            <p>{props.message}</p>
        </div>
    )
}

export default ClosableError;
