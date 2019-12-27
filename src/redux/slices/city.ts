import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { fetchCityInfo } from '../../lib/api';
import { getPersistConfig } from '../helpers/persist';

import { AppThunk } from '../index';

import { setItems as setMenuItems } from './menu';

export type City = {
    currentCity: {
        name: string;
        geoid: number;
    };
};

const initialState: City = {
    currentCity: {
        name: 'Москва',
        geoid: 213,
    },
};

const city = createSlice({
    name: 'city',
    initialState,
    reducers: {
        setCity(state, action: PayloadAction<City['currentCity']>) {
            state.currentCity = action.payload;
        },
    },
});

export const { setCity } = city.actions;

export const loadCityInfo = (geoid: number): AppThunk => async dispatch => {
    try {
        const { cityInfo } = await fetchCityInfo(geoid);
        dispatch(
            setCity({
                name: cityInfo.name,
                geoid: cityInfo.geoid,
            })
        );
        dispatch(setMenuItems(cityInfo.eventsMenu));
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error({ err });
    }
};

const persistConfig = getPersistConfig<City>('city');
export default persistReducer(persistConfig, city.reducer);
