import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';
import axios from 'axios';

import { IApplicationState } from '@store/index';

export enum AuthenticationActionTypes {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT'
}

export interface ILoginAction extends Action {
    type: AuthenticationActionTypes.LOGIN
}

export interface ILogoutAction extends Action {
    type: AuthenticationActionTypes.LOGOUT
}

export function login(payload: any): ThunkAction<void, IApplicationState, null, Action<String>> {
    return async dispatch => {
        await axios.post(`/api/signup`, payload);
        dispatch({
            type: AuthenticationActionTypes.LOGIN
        });
    }
}

export function logout(): ILogoutAction {
    return {
        type: AuthenticationActionTypes.LOGOUT
    };
}

export type AuthenticationAction = ILoginAction | ILogoutAction;