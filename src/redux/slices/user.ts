import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import {
    authorize,
    getCurrentUserId,
    identify,
    UserInfo,
    YandexAuthScope
} from '../../lib/account-manager';

import { AppThunk } from '../index';
import { cleanup } from '../actions';
import { getPersistConfig } from '../helpers/persist';

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
        setPsuid(state, action: PayloadAction<string>) {
            state.psuid = action.payload;
        },
        setJwtToken(state, action: PayloadAction<string>) {
            state.jwtToken = action.payload;
        },
        setUser(state, action: PayloadAction<UserInfo>) {
            state.currentUser = action.payload;
        },
        setAuthorizedScopes(state, action: PayloadAction<YandexAuthScope[]>) {
            state.authorizedScopes = action.payload;
        },
    },
    extraReducers: builder => {
        builder.addCase(cleanup, () => initialState);
    }
});

export const { setPsuid, setJwtToken, setUser, setAuthorizedScopes } = user.actions;

const SCOPES = [
    YandexAuthScope.Avatar,
    YandexAuthScope.Info,
    YandexAuthScope.Email,
];

export const loadUserInfo = (): AppThunk => async dispatch => {
    try {
        const { userInfo, tokenInfo: { authorizedScopes } } = await authorize(SCOPES);

        dispatch(setUser(userInfo.payload));
        dispatch(setAuthorizedScopes(authorizedScopes));
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
        const { jwtToken, payload } = await identify();

        if (psuid && psuid !== payload.psuid) {
            return dispatch(cleanup());
        }

        dispatch(setPsuid(payload.psuid));
        dispatch(setJwtToken(jwtToken));
        dispatch(loadUserInfo());

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
    } catch (err) {
        console.error(err);

        if (psuid) {
            dispatch(cleanup());
        }
    }
};

const persistConfig = getPersistConfig<User>('user');
export default persistReducer(persistConfig, user.reducer);
