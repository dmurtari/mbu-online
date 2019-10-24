import { Store, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from './reducer';
import { IAuthenticationState } from './authentication/reducers';

export interface IApplicationState {
    authentication: IAuthenticationState;
}

const store: Store<IApplicationState> = createStore(rootReducer, applyMiddleware(thunk));

export default store;