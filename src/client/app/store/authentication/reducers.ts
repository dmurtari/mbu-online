import { AuthenticationAction, AuthenticationActionTypes } from './actions';

export interface IAuthenticationState {
    authenticated: boolean | null;
    currentUser: any;
}

const initialState: IAuthenticationState = {
    authenticated: null,
    currentUser: null
}

export default function authenticationReducer(
    state: IAuthenticationState = initialState, 
    action: AuthenticationAction
): IAuthenticationState {
    switch (action.type) {
        case AuthenticationActionTypes.LOGIN:
            return {
                ...state,
                authenticated: true
            };
        case AuthenticationActionTypes.LOGOUT: 
            return {
                ...state,
                authenticated: false
            };
        default:
            return state;
    }
}