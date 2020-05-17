import { configureStore, Action, getDefaultMiddleware, combineReducers } from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
import { persistStore } from 'redux-persist';
import * as PERSIST_CONTSTANS from 'redux-persist/lib/constants';

import eventReducer from './slices/event';
import actualEventsReducer from './slices/actual-events';
import rubricEventsReducer from './slices/rubric-events';
import selectionsReducer from './slices/selections';
import selectionEventsReducer from './slices/selection-events';
import cityReducer from './slices/city';
import cityListReducer from './slices/city-list';
import searchReducer from './slices/search';
import menuReducer from './slices/menu';
import dateFilterReducer from './slices/date-filter';
import recommendedReducer from './slices/recommended-events';
import userReducer from './slices/user';
import orderReducer from './slices/order';

const PERSIST_ACTIONS = [
    PERSIST_CONTSTANS.FLUSH,
    PERSIST_CONTSTANS.REHYDRATE,
    PERSIST_CONTSTANS.PAUSE,
    PERSIST_CONTSTANS.PERSIST,
    PERSIST_CONTSTANS.PURGE,
    PERSIST_CONTSTANS.REGISTER,
];
const rootReducer = combineReducers({
    event: eventReducer,
    actualEvents: actualEventsReducer,
    rubricEvents: rubricEventsReducer,
    selections: selectionsReducer,
    selectionEvents: selectionEventsReducer,
    city: cityReducer,
    cityList: cityListReducer,
    search: searchReducer,
    menu: menuReducer,
    dateFilter: dateFilterReducer,
    recommendedEvents: recommendedReducer,
    user: userReducer,
    order: orderReducer,
});
const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: PERSIST_ACTIONS,
        },
    }),
});

export type RootReducer = ReturnType<typeof rootReducer>;
export type AppThunk = ThunkAction<void, RootReducer, null, Action<string>>;

export const persistor = persistStore(store);

export default store;
