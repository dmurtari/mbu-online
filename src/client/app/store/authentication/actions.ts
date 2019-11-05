import { Action, Dispatch } from 'redux';
import axios from 'axios';

import { LoginRequestDto } from '@interfaces/user.interface';

export enum AuthenticationActionTypes {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT'
}

export interface ILoginAction extends Action {
    type: AuthenticationActionTypes.LOGIN;
}

export interface ILogoutAction extends Action {
    type: AuthenticationActionTypes.LOGOUT;
}

export const createLogin = (payload: LoginRequestDto) => {
    return async (dispatch: Dispatch) => {
        await axios.post(`/api/signup`, payload);
        dispatch({
            type: AuthenticationActionTypes.LOGIN
        });
    };
};

export function logout(): ILogoutAction {
    return {
        type: AuthenticationActionTypes.LOGOUT
    };
}

export type AuthenticationAction = ILoginAction | ILogoutAction;
