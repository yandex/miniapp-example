import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { fetchSelectionEvents } from '../../lib/api';
import { SelectionsResponse } from '../../lib/api/types';
import { ActualEvents } from '../../lib/api/fragments/actual-events';

import {
    createPersistKeyByFilter,
    restoreFilterFromPersistKey,
    stateReconcilerByDate,
    getPersistConfig,
    getTransformUIPersistance,
} from '../helpers/persist';

import { AppThunk, RootState } from '../index';
import { setEvents } from './event';
import { DateFilter } from './date-filter';
import { fetchSuccess as selectionsFetchSuccess } from './selections';

export type SelectionEventsState = {
    data: {
        [key: string]: {
            title: string;
            events: ActualEvents;
            hasMoreItems: boolean;

            updatedAt: number;
        };
    };
    ui: { [key: string]: { isLoading: boolean; isLoadingMore: boolean; isUpdating: boolean } };
};

const initialState: SelectionEventsState = {
    data: {},
    ui: {},
};

const loadMoreLimit = 10;
const updateInterval = 300 * 1000;

const slice = createSlice({
    name: 'selection-events',
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
    extraReducers: builder => {
        // Предзаполнение списка событий для всех подборок, загруженных на главной странице
        builder.addCase(
            selectionsFetchSuccess,
            (state, action: PayloadAction<{ key: string; items: SelectionsResponse['selections'] }>) => {
                const { key, items } = action.payload;
                const filter = restoreFilterFromPersistKey(key);

                for (const selection of items) {
                    if (!selection) {
                        continue;
                    }

                    const eventsKey = createPersistKeyByFilter({ code: selection.code, ...filter });
                    const events = {
                        items: selection.events,
                        paging: { offset: 0, total: selection.count },
                    };

                    if (!state.data[eventsKey]) {
                        state.data[eventsKey] = {
                            title: selection.title,
                            events,
                            hasMoreItems: Boolean(selection.count > loadMoreLimit),
                            // При переходе в подборку нужно обновить заголовок, поэтому считаем что данные не загружены
                            updatedAt: 0,
                        };
                        state.ui[eventsKey] = {
                            isLoading: false,
                            isLoadingMore: false,
                            isUpdating: false,
                        };
                    } else {
                        state.data[eventsKey].events = events;
                        state.data[eventsKey].hasMoreItems = Boolean(selection.count > loadMoreLimit);
                        state.data[eventsKey].updatedAt = Date.now();
                    }
                }
            }
        );
    },
});

export const { fetchStart, fetchSuccess, fetchError, fetchMoreStart, fetchMoreSuccess, fetchMoreError } = slice.actions;

export const selectionEventsSelector = (code: string) => (state: RootState) => {
    const persistKey = createPersistKeyByFilter({
        code,
        geoid: state.city.currentCity.geoid,
        ...state.dateFilter,
    });

    return state.selectionEvents.data[persistKey];
};

export const selectionEventsUISelector = (code: string) => (state: RootState) => {
    const persistKey = createPersistKeyByFilter({
        code,
        geoid: state.city.currentCity.geoid,
        ...state.dateFilter,
    });

    return state.selectionEvents.ui[persistKey];
};

export const loadSelectionEvents = (code: string, dateFilter?: DateFilter): AppThunk => async(dispatch, getState) => {
    const { geoid } = getState().city.currentCity;
    const key = createPersistKeyByFilter({ geoid, code, ...dateFilter });
    const events = getState().selectionEvents.data[key];

    if (events && events.updatedAt + updateInterval > Date.now()) {
        return;
    }

    dispatch(fetchStart({ key }));

    try {
        const { title, events } = await fetchSelectionEvents(code, {
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

export const loadMoreSelectionEvents = (code: string, dateFilter?: DateFilter): AppThunk => async(
    dispatch,
    getState
) => {
    const { geoid } = getState().city.currentCity;
    const key = createPersistKeyByFilter({ geoid, code, ...dateFilter });

    dispatch(fetchMoreStart({ key }));

    try {
        const { offset } = getState().selectionEvents.data[key].events.paging;
        const { events } = await fetchSelectionEvents(code, {
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

const persistConfig = getPersistConfig<SelectionEventsState>('selection-events', {
    stateReconciler: stateReconcilerByDate,
    transforms: [getTransformUIPersistance<SelectionEventsState['ui']>(initialState.ui)],
});
export default persistReducer(persistConfig, slice.reducer);
