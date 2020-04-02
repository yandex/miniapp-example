import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { fetchCityInfo, MOSCOW } from '../../lib/api';
import { getCurrentPosition } from '../../lib/geolocation';
import { getPersistConfig } from '../helpers/persist';

import { AppThunk } from '../index';

import { setItems as setMenuItems } from './menu';

export type City = {
    useGeolocation: boolean;
    isFetchingLocation: boolean;
    currentCity: {
        name: string;
        geoid: number;
        longitude: number;
        latitude: number;
    };
};

const initialState: City = {
    useGeolocation: true,
    isFetchingLocation: false,
    currentCity: MOSCOW,
};

const city = createSlice({
    name: 'city',
    initialState,
    reducers: {
        setCity(state, action: PayloadAction<City['currentCity']>) {
            state.currentCity = action.payload;
        },
        setGeolocation(state, action: PayloadAction<boolean>) {
            state.useGeolocation = action.payload;
        },
        locationFetchStart(state) {
            state.isFetchingLocation = true;
        },
        locationFetchSuccess(state) {
            state.isFetchingLocation = false;
        },
        locationFetchFailed(state, action: PayloadAction<boolean>) {
            state.isFetchingLocation = false;
            state.useGeolocation = false;

            if (action.payload) {
                alert('Не удалось получить вашу геолокацию!');
            }
        },
    },
});

export const { setCity, setGeolocation, locationFetchStart, locationFetchSuccess, locationFetchFailed } = city.actions;

export const loadCityInfoByLocation = (showError: boolean): AppThunk => async dispatch => {
    dispatch(locationFetchStart());

    try {
        const coords = await getCurrentPosition();

        const options = {
            longitude: coords.longitude,
            latitude: coords.latitude,
        };

        const { cityInfo } = await fetchCityInfo(options);

        dispatch(
            setCity({
                name: cityInfo.name,
                geoid: cityInfo.geoid,
                longitude: cityInfo.longitude,
                latitude: cityInfo.latitude,
            })
        );

        dispatch(setMenuItems(cityInfo.eventsMenu));
        dispatch(locationFetchSuccess());
    } catch (err) {
        console.error(err);
        dispatch(locationFetchFailed(showError));
    }
};

export const loadCityInfo = (): AppThunk => async(dispatch, getState) => {
    const cityState = getState().city;

    try {
        if (cityState.useGeolocation) {
            dispatch(loadCityInfoByLocation(false));

            return;
        }

        const { cityInfo } = await fetchCityInfo({
            longitude: cityState.currentCity.longitude,
            latitude: cityState.currentCity.latitude,
        });

        dispatch(setMenuItems(cityInfo.eventsMenu));
    } catch (err) {
        console.error(err);
    }
};

export const toggleGeolocation = (isActive: boolean): AppThunk => async dispatch => {
    if (isActive) {
        dispatch(loadCityInfoByLocation(true));
    }

    dispatch(setGeolocation(isActive));
};

const persistConfig = getPersistConfig<City>('city');
export default persistReducer(persistConfig, city.reducer);
