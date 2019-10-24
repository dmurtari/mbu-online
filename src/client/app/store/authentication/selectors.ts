import { IApplicationState } from '@store/index';

export const getAuthenticationStatus = (store: IApplicationState) => store.authentication.authenticated;