import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { ActualEvents } from '../../lib/api/fragments/actual-events';

import { fetchRubricEvents } from '../../lib/api';
import {
    createPersistKeyByFilter,
    stateReconcilerByDate,
    getPersistConfig,
    getTransformUIPersistance,
} from '../helpers/persist';

import { AppThunk, RootReducer } from '../index';
import { setEvents } from './event';
import { DateFilter } from './date-filter';

export type RubricEventsState = {
    data: {
        [key: string]: {
            title: string;
            events: ActualEvents;
            hasMoreItems: boolean;
            updatedAt: number;
        };
    };
    ui: {
        [key: string]: {
            isLoading: boolean;
            isLoadingMore: boolean;
            isUpdating: boolean;
        };
    };
};

const initialState: RubricEventsState = {
    data: {},
    ui: {},
};

const loadMoreLimit = 10;
const updateInterval = 300 * 1000;

const slice = createSlice({
    name: 'rubric-events',
    initialState,
    reducers: {
        fetchStart(state, action: PayloadAction<{ key: string }>) {
            const { key } = action.payload;

            if (!state.data[key]) {
                state.data[key] = {
                    title: '',
                    events: {
                        items: [],
                        paging: { offset: 0, total: 0 },
                    },
                    hasMoreItems: false,
                    updatedAt: 0,
                };
            }
            if (!state.ui[key]) {
                state.ui[key] = {
                    isLoading: false,
                    isLoadingMore: false,
                    isUpdating: false,
                };
            }

            if (!state.data[key].events.items.length) {
                state.ui[key].isLoading = true;
            } else {
                state.ui[key].isUpdating = true;
            }
        },
        fetchSuccess(state, action: PayloadAction<{ key: string; events: ActualEvents; title: string }>) {
            const { key, events, title } = action.payload;

            state.data[key].title = title;
            state.data[key].events = events;
            state.data[key].hasMoreItems = Boolean(events.paging.total > events.paging.offset + loadMoreLimit);
            state.data[key].updatedAt = Date.now();
            state.ui[key].isLoading = false;
            state.ui[key].isUpdating = false;
        },
        fetchError(state, action: PayloadAction<{ key: string; error: Error }>) {
            const { key } = action.payload;

            state.ui[key].isLoading = false;
            state.ui[key].isUpdating = false;
        },
        fetchMoreStart(state, action: PayloadAction<{ key: string }>) {
            const { key } = action.payload;

            state.ui[key].isLoadingMore = true;
        },
        fetchMoreSuccess(state, action: PayloadAction<{ key: string; events: ActualEvents }>) {
            const { key, events } = action.payload;

            state.data[key].events.items.push(...events.items);
            state.data[key].events.paging = events.paging;
            state.data[key].hasMoreItems = Boolean(events.paging.total > events.paging.offset + loadMoreLimit);
            state.data[key].updatedAt = Date.now();
            state.ui[key].isLoadingMore = false;
        },
        fetchMoreError(state, action: PayloadAction<{ key: string; error: Error }>) {
            const { key } = action.payload;

            state.ui[key].isLoadingMore = false;
        },
    },
});

export const { fetchStart, fetchSuccess, fetchError, fetchMoreStart, fetchMoreSuccess, fetchMoreError } = slice.actions;

export const rubricEventsSelector = (code: string) => (state: RootReducer) => {
    const persistKey = createPersistKeyByFilter({
        code,
        geoid: state.city.currentCity.geoid,
        ...state.dateFilter,
    });

    return state.rubricEvents.data[persistKey];
};

export const rubricEventsUISelector = (code: string) => (state: RootReducer) => {
    const persistKey = createPersistKeyByFilter({
        code,
        geoid: state.city.currentCity.geoid,
        ...state.dateFilter,
    });

    return state.rubricEvents.ui[persistKey];
};

export const loadRubricEvents = (code: string, dateFilter?: DateFilter): AppThunk => async(dispatch, getState) => {
    const { geoid } = getState().city.currentCity;
    const key = createPersistKeyByFilter({ geoid, code, ...dateFilter });
    const events = getState().rubricEvents.data[key];

    if (events && events.updatedAt + updateInterval > Date.now()) {
        return;
    }

    dispatch(fetchStart({ key }));

    try {
        const { title, events } = await fetchRubricEvents(code, {
            geoid,
            offset: 0,
            limit: loadMoreLimit,
            ...dateFilter,
        });

        if (events.prefetchItems) {
            dispatch(setEvents({ events: events.prefetchItems }));
            delete events.prefetchItems;
        }

        dispatch(fetchSuccess({ key, title, events }));
    } catch (err) {
        console.error(err);
        dispatch(fetchError({ key, error: err }));
    }
};

export const loadMoreRubricEvents = (code: string, dateFilter?: DateFilter): AppThunk => async(dispatch, getState) => {
    const { geoid } = getState().city.currentCity;
    const key = createPersistKeyByFilter({ geoid, code, ...dateFilter });

    dispatch(fetchMoreStart({ key }));

    try {
        const { offset } = getState().rubricEvents.data[key].events.paging;
        const { events } = await fetchRubricEvents(code, {
            geoid,
            offset: offset + loadMoreLimit,
            limit: loadMoreLimit,
            ...dateFilter,
        });

        if (events.prefetchItems) {
            dispatch(setEvents({ events: events.prefetchItems }));
            delete events.prefetchItems;
        }

        dispatch(fetchMoreSuccess({ key, events }));
    } catch (err) {
        console.error(err);
        dispatch(fetchMoreError({ key, error: err }));
    }
};

const persistConfig = getPersistConfig<RubricEventsState>('rubric-events', {
    stateReconciler: stateReconcilerByDate,
    transforms: [getTransformUIPersistance<RubricEventsState['ui']>(initialState.ui)],
});
export default persistReducer(persistConfig, slice.reducer);
