import { combineReducers } from 'redux';

import authenticationReducer from './authentication/reducers';
import { IApplicationState } from '.';

export default combineReducers<IApplicationState>({
    authentication: authenticationReducer
});