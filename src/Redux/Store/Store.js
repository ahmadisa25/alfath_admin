import { applyMiddleware, compose } from 'redux';
import {configureStore} from '@reduxjs/toolkit';

import thunk from 'redux-thunk';
import AuthReducer from '../Reducer/AuthReducer';

const store = configureStore({
    reducer: {
      auth: AuthReducer,
    },
    middleware: (getDefaultMiddleware) => [
      ...getDefaultMiddleware().concat(thunk)
    ]
  });

  export default store;