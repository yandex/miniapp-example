import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { fetchEvent } from '../../lib/api';
import { EventResponse } from '../../lib/api/types';
import { getPersistConfig, getTransformUIPersistance } from '../helpers/persist';
import { AppThunk, RootState } from '..';

export type Event = EventResponse['event'];
export type ScheduleInfo = EventResponse['scheduleInfo'];

export type EventPage = {
    event: Event | null;
    schedule: ScheduleInfo | null;
    updatedAt: number;
};
export type EventPageState = {
    data: { [id: string]: EventPage };
    ui: { [id: string]: { isLoading: boolean; isUpdating: boolean } };
};

const initialState: EventPageState = {
    data: {},
    ui: {},
};
const updateInterval = 300 * 1000;

const slice = createSlice({
    name: 'event',
    initialState,
    reducers: {
        fetchStart(state, action: PayloadAction<{ id: string }>) {
            const { id } = action.payload;

            if (!state.data[id]) {
                state.data[id] = {
                    event: null,
                    schedule: null,
                    updatedAt: 0,
                };
            }
            if (!state.ui[id]) {
                state.ui[id] = {
                    isLoading: false,
                    isUpdating: false,
                };
            }

            if (!state.data[id].event) {
                state.ui[id].isLoading = true;
            } else {
                state.ui[id].isUpdating = true;
            }
        },
        fetchSuccess(state, action: PayloadAction<{ id: string; event: EventResponse }>) {
            const { id, event } = action.payload;

            state.data[id].event = event.event;
            state.data[id].schedule = event.scheduleInfo;
            state.data[id].updatedAt = Date.now();
            state.ui[id].isLoading = false;
            state.ui[id].isUpdating = false;
        },
        fetchError(state, action: PayloadAction<{ id: string; error: Error }>) {
            const { id } = action.payload;

            state.ui[id].isLoading = false;
            state.ui[id].isUpdating = false;
        },
        setEvents(state, action: PayloadAction<{ events: EventResponse[] }>) {
            const { events } = action.payload;

            events.forEach(event => {
                if (!event) {
                    return;
                }

                const { id } = event.event;

                if (!state.data[id]) {
                    state.data[id] = {
                        event: null,
                        schedule: null,
                        updatedAt: 0,
                    };
                }
                if (!state.ui[id]) {
                    state.ui[id] = {
                        isLoading: false,
                        isUpdating: false,
                    };
                }

                state.data[id].event = event.event;
                state.data[id].schedule = event.scheduleInfo;
                state.data[id].updatedAt = Date.now();
            });
        },
    },
});

export const { fetchStart, fetchSuccess, fetchError, setEvents } = slice.actions;

export const eventPageSelector = (id: string) => (state: RootState) => state.event.data[id] ?? {};

export const loadEvent = (id: string): AppThunk => async(dispatch, getState) => {
    const event = getState().event.data[id];

    if (event && event.updatedAt + updateInterval > Date.now()) {
        return;
    }

    dispatch(fetchStart({ id }));

    try {
        const event = await fetchEvent(id);
        dispatch(fetchSuccess({ id, event }));
    } catch (err) {
        console.error(err);
        dispatch(fetchError({ id, error: err }));
    }
};

const persistConfig = getPersistConfig<EventPageState>('events', {
    transforms: [getTransformUIPersistance<EventPageState['ui']>(initialState.ui)],
});
export default persistReducer(persistConfig, slice.reducer);
