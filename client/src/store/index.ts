import { Store, createStore } from 'redux';

import rootReducer from './reducer';

const store: Store = createStore(rootReducer, {});

export default store;