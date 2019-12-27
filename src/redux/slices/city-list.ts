import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { fetchCityList } from '../../lib/api';
import { getPersistConfig } from '../helpers/persist';

import { CityListItem } from '../../lib/api/fragments/city-list-item';
import { AppThunk } from '../index';

export type CityListState = {
    isLoading: boolean;
    items: CityListItem[];
};

const initialState: CityListState = {
    isLoading: false,
    items: [],
};

const cityList = createSlice({
    name: 'city-list',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
        setCityListResult(state, action: PayloadAction<CityListState['items']>) {
            state.items = action.payload;
        },
    },
});

export const { setLoading, setCityListResult } = cityList.actions;

export const loadCityList = (): AppThunk => async dispatch => {
    dispatch(setLoading(true));

    try {
        const { cities } = await fetchCityList();
        dispatch(setCityListResult(cities));
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error({ err });
    }

    dispatch(setLoading(false));
};

const persistConfig = getPersistConfig<CityListState>('city-list', {
    blacklist: ['isLoading'],
});
export default persistReducer(persistConfig, cityList.reducer);
