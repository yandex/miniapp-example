import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { ActualEvents } from '../../lib/api/fragments/actual-events';

import { fetchRecommendedEvents } from '../../lib/api';
import {
    createPersistKeyByFilter,
    stateReconcilerByDate,
    getPersistConfig,
    getTransformUIPersistance,
} from '../helpers/persist';
import { setEvents } from './event';
import { AppThunk, RootState } from '..';

export type RecommendedEvents = {
    top?: ActualEvents;
    concert?: ActualEvents;
    cinema?: ActualEvents;
    theatre?: ActualEvents;
    updatedAt: number;
};
export type RecommendedEventsState = {
    data: { [key: string]: RecommendedEvents };
    ui: { [key: string]: { isLoading: boolean; isUpdating: boolean } };
};

const initialState: RecommendedEventsState = {
    data: {},
    ui: {},
};
const updateInterval = 300 * 1000;

const slice = createSlice({
    name: 'recommended-events',
    initialState,
    reducers: {
        fetchStart(state, action: PayloadAction<{ key: string }>) {
            const { key } = action.payload;

            if (!state.data[key]) {
                state.data[key] = { updatedAt: 0 };
            }
            if (!state.ui[key]) {
                state.ui[key] = { isLoading: false, isUpdating: false };
            }

            if (!state.data[key].updatedAt) {
                state.ui[key].isLoading = true;
            } else {
                state.ui[key].isUpdating = true;
            }
        },
        fetchSuccess(
            state,
            action: PayloadAction<{
                key: string;
                data: Pick<RecommendedEvents, 'top' | 'concert' | 'cinema' | 'theatre'>;
            }>
        ) {
            const { key, data } = action.payload;

            state.data[key].top = data.top;
            state.data[key].concert = data.concert;
            state.data[key].cinema = data.cinema;
            state.data[key].theatre = data.theatre;
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

export const recommendedEventsSelector = (state: RootState) => {
    const persistKey = createPersistKeyByFilter({
        geoid: state.city.currentCity.geoid,
    });

    return state.recommendedEvents.data[persistKey];
};

export const recommendedEventsUISelector = (state: RootState) => {
    const persistKey = createPersistKeyByFilter({
        geoid: state.city.currentCity.geoid,
    });

    return state.recommendedEvents.ui[persistKey];
};

export const loadRecommendedEvents = (): AppThunk => async(dispatch, getState) => {
    const { geoid } = getState().city.currentCity;
    const key = createPersistKeyByFilter({ geoid });
    const events = getState().recommendedEvents.data[key];

    if (events && events.updatedAt + updateInterval > Date.now()) {
        return;
    }

    dispatch(fetchStart({ key }));

    try {
        const data = await fetchRecommendedEvents({ geoid });

        dispatch(
            setEvents({
                events: [
                    ...(data.top?.prefetchItems || []),
                    ...(data.cinema?.prefetchItems || []),
                    ...(data.concert?.prefetchItems || []),
                    ...(data.theatre?.prefetchItems || []),
                ],
            })
        );

        if (data.top?.prefetchItems) delete data.top.prefetchItems;
        if (data.cinema?.prefetchItems) delete data.cinema.prefetchItems;
        if (data.concert?.prefetchItems) delete data.concert.prefetchItems;
        if (data.theatre?.prefetchItems) delete data.theatre.prefetchItems;

        dispatch(fetchSuccess({ key, data }));
    } catch (err) {
        console.error(err);
        dispatch(fetchError({ key, error: err }));
    }
};

const persistConfig = getPersistConfig<RecommendedEventsState>('recommended-events', {
    stateReconciler: stateReconcilerByDate,
    transforms: [getTransformUIPersistance<RecommendedEventsState['ui']>(initialState.ui)],
});
export default persistReducer(persistConfig, slice.reducer);
