import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import {
    authorize,
    getCurrentUserId,
    identify,
    UserInfo,
    YandexAuthScope,
} from '../../lib/account-manager';

import { AppThunk, RootReducer } from '../index';
import { cleanup } from '../actions';
import { getPersistConfig } from '../helpers/persist';

import { fetchOrders } from './order';

export type User = {
    jwtToken?: string;
    psuid?: string;
    currentUser: UserInfo;
    authorizedScopes: YandexAuthScope[];
};

const initialState: User = {
    currentUser: {},
    authorizedScopes: []
};

const user = createSlice({
    name: 'user',
    initialState,
    reducers: {
        identified(state, action: PayloadAction<{ psuid: string, token: string }>) {
            state.jwtToken = action.payload.token;
            state.psuid = action.payload.psuid;
        },
        authorized(state, action: PayloadAction<{ user: UserInfo, scopes: YandexAuthScope[] }>) {
            state.currentUser = action.payload.user;
            state.authorizedScopes = action.payload.scopes;
        },
        logout(state) {
            state.currentUser = {};
            state.authorizedScopes = [];
        },
    },
    extraReducers: builder => {
        builder.addCase(cleanup, () => initialState);
    }
});

export const { identified, authorized, logout } = user.actions;

export const isIdentifiedSelector = (state: RootReducer) => Boolean(state.user.psuid);

export const isAuthorizedSelector = (state: RootReducer) => Boolean(state.user.currentUser.uid);

const SCOPES = [
    YandexAuthScope.Avatar,
    YandexAuthScope.Info,
    YandexAuthScope.Email,
];

export const loadUserInfo = (): AppThunk => async dispatch => {
    try {
        const { userInfo, tokenInfo: { authorizedScopes } } = await authorize(SCOPES);

        dispatch(authorized({ user: userInfo.payload, scopes: authorizedScopes }));
    } catch (err) {
        console.error(err);
        if (!['authorization denied', 'authorization cancelled'].includes(err.message)) {
            alert('Не удалось получить информацию о пользователе');
        }
    }
};

export const login = (afterLogin?: () => void): AppThunk => async(dispatch, getState) => {
    try {
        const { user: { psuid } } = getState();
        const psuidInfo = await identify();

        if (psuid && psuid !== psuidInfo.payload.psuid) {
            dispatch(cleanup());
        }

        dispatch(identified({ token: psuidInfo.jwtToken, psuid: psuidInfo.payload.psuid }));
        await dispatch(loadUserInfo());
        await dispatch(fetchOrders());

        afterLogin?.();
    } catch (err) {
        console.error(err);
        if (err.message !== 'user not logged') {
            alert('Не удалось войти. Попробуйте ещё раз');
        }
    }
};

export const checkSession = (): AppThunk => async(dispatch, getState) => {
    const { psuid } = getState().user;

    try {
        const userId = await getCurrentUserId();

        if (psuid && (!userId || userId.payload.psuid !== psuid)) {
            dispatch(cleanup());
        }

        if (userId) {
            dispatch(identified({ token: userId.jwtToken, psuid: userId.payload.psuid }));
            dispatch(fetchOrders());
        }
    } catch (err) {
        console.error(err);

        if (psuid) {
            dispatch(cleanup());
        }
    }
};

const persistConfig = getPersistConfig<User>('user');
export default persistReducer(persistConfig, user.reducer);
