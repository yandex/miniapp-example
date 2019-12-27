import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { ActualEvent } from '../../lib/api/fragments/actual-event';

import { fetchActualEvents } from '../../lib/api';
import {
    createPersistKeyByFilter,
    stateReconcilerByDate,
    getPersistConfig,
    getTransformUIPersistance,
} from '../helpers/persist';
import { setEvents } from './event';
import { AppThunk, RootReducer } from '..';

import { DateFilter } from './date-filter';

export type ActualEventsListState = {
    data: {
        [key: string]: {
            items: Array<ActualEvent | null>;
            updatedAt: number;
        };
    };
    ui: {
        [key: string]: {
            isLoading: boolean;
            isUpdating: boolean;
        };
    };
};

const initialState: ActualEventsListState = {
    data: {},
    ui: {},
};
const updateInterval = 300 * 1000;

const slice = createSlice({
    name: 'actual-events',
    initialState,
    reducers: {
        fetchStart(state, action: PayloadAction<{ key: string }>) {
            const { key } = action.payload;

            if (!state.data[key]) {
                state.data[key] = {
                    items: [],
                    updatedAt: 0,
                };
            }
            if (!state.ui[key]) {
                state.ui[key] = {
                    isLoading: false,
                    isUpdating: false,
                };
            }

            if (!state.data[key].items.length) {
                state.ui[key].isLoading = true;
            } else {
                state.ui[key].isUpdating = true;
            }
        },
        fetchSuccess(state, action: PayloadAction<{ key: string; items: Array<ActualEvent | null> }>) {
            const { key, items } = action.payload;

            state.data[key].items = items;
            state.data[key].updatedAt = Date.now();
            state.ui[key].isLoading = false;
            state.ui[key].isUpdating = false;
        },
        fetchError(state, action: PayloadAction<{ key: string; error: Error }>) {
            const { key } = action.payload;

            state.ui[key].isLoading = false;
            state.ui[key].isUpdating = false;
        },
    },
});

export const { fetchStart, fetchSuccess, fetchError } = slice.actions;

export const actualEventsSelector = (state: RootReducer) => {
    const persistKey = createPersistKeyByFilter({
        geoid: state.city.currentCity.geoid,
        ...state.dateFilter,
    });

    return state.actualEvents.data[persistKey];
};

export const actualEventsUISelector = (state: RootReducer) => {
    const persistKey = createPersistKeyByFilter({
        geoid: state.city.currentCity.geoid,
        ...state.dateFilter,
    });

    return state.actualEvents.ui[persistKey];
};

export const loadActualEvents = (dateFilter: DateFilter, geoid: number): AppThunk => async(dispatch, getState) => {
    const key = createPersistKeyByFilter({ geoid, ...dateFilter });
    const events = getState().actualEvents.data[key];

    if (events && events.updatedAt + updateInterval > Date.now()) {
        return;
    }

    dispatch(fetchStart({ key }));

    try {
        const { events } = await fetchActualEvents({ ...dateFilter, geoid });

        if (events.prefetchItems) {
            dispatch(setEvents({ events: events.prefetchItems }));
            delete events.prefetchItems;
        }

        dispatch(fetchSuccess({ key, items: events.items }));
    } catch (err) {
        console.error(err);
        dispatch(fetchError({ key, error: err }));
    }
};

const persistConfig = getPersistConfig<ActualEventsListState>('actual-events', {
    stateReconciler: stateReconcilerByDate,
    transforms: [getTransformUIPersistance<ActualEventsListState['ui']>(initialState.ui)],
});
export default persistReducer(persistConfig, slice.reducer);
