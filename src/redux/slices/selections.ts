import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { fetchSelections } from '../../lib/api';
import { SelectionsResponse } from '../../lib/api/types';
import { EventPreview } from '../../lib/api/fragments/event-preview';

import {
    createPersistKeyByFilter,
    stateReconcilerByDate,
    getPersistConfig,
    getTransformUIPersistance,
} from '../helpers/persist';
import { AppThunk, RootState } from '../index';
import { DateFilter } from './date-filter';

export type SelectionsState = {
    data: {
        [key: string]: {
            items: Selection[];
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

export type Selection = {
    code: string;
    title: string;
    count: number;
    image: EventPreview['image'];
};

const initialState: SelectionsState = {
    data: {},
    ui: {},
};
const updateInterval = 300 * 1000;

const slice = createSlice({
    name: 'selections',
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
        fetchSuccess(state, action: PayloadAction<{ key: string; items: SelectionsResponse['selections'] }>) {
            const { key, items } = action.payload;

            const selections: Selection[] = [];

            for (const selection of items) {
                if (!selection) {
                    continue;
                }

                selections.push({
                    code: selection.code,
                    title: selection.title,
                    count: selection.count,
                    image:
                        selection.events &&
                        selection.events[0] &&
                        selection.events[0].eventPreview &&
                        selection.events[0].eventPreview.image,
                });
            }

            state.data[key].items = selections;
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

export const selectionsSelector = (state: RootState) => {
    const persistKey = createPersistKeyByFilter({
        geoid: state.city.currentCity.geoid,
        ...state.dateFilter,
    });

    return state.selections.data[persistKey];
};

export const selectionsUISelector = (state: RootState) => {
    const persistKey = createPersistKeyByFilter({
        geoid: state.city.currentCity.geoid,
        ...state.dateFilter,
    });

    return state.selections.ui[persistKey];
};

export const loadSelections = (dateFilter: DateFilter, geoid: number): AppThunk => async(dispatch, getState) => {
    const key = createPersistKeyByFilter({ geoid, ...dateFilter });
    const selections = getState().selections.data[key];

    if (selections && selections.updatedAt + updateInterval > Date.now()) {
        return;
    }

    dispatch(fetchStart({ key: key }));

    try {
        const data = await fetchSelections({ ...dateFilter, geoid });
        dispatch(fetchSuccess({ key, items: data.selections }));
    } catch (err) {
        console.error(err);
        dispatch(fetchError({ key: key, error: err }));
    }
};

const persistConfig = getPersistConfig<SelectionsState>('selections', {
    stateReconciler: stateReconcilerByDate,
    transforms: [getTransformUIPersistance<SelectionsState['ui']>(initialState.ui)],
});
export default persistReducer(persistConfig, slice.reducer);
