import { Action, Dispatch } from 'redux';
import axios from 'axios';

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

export const createLogin = (payload: any) => {
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
