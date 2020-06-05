import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { authorizeScopes, getCurrentUserId, identify, UserInfo, YandexAuthScope } from '../../lib/account-manager';

import { AppThunk, RootState } from '../index';
import { cleanup } from '../actions';
import { getPersistConfig } from '../helpers/persist';

import { fetchOrders } from './order';

export type User = {
    jwtToken?: string;
    psuid?: string;
    currentUser: UserInfo;
    authorizedScopes: YandexAuthScope[];
    loggedOutPsuid?: string;
};

const initialState: User = {
    currentUser: {},
    authorizedScopes: [],
};

const user = createSlice({
    name: 'user',
    initialState,
    reducers: {
        authenticated(state, action: PayloadAction<{ psuid: string; token: string }>) {
            state.jwtToken = action.payload.token;
            state.psuid = action.payload.psuid;

            delete state.loggedOutPsuid;
        },
        authorized(state, action: PayloadAction<{ user: UserInfo; scopes: YandexAuthScope[] }>) {
            state.currentUser = action.payload.user;
            state.authorizedScopes = action.payload.scopes;
        },
        logout(state) {
            return {
                ...initialState,
                loggedOutPsuid: state.psuid,
            };
        },
    },
    extraReducers: builder => {
        builder.addCase(cleanup, () => initialState);
    },
});

export const { authenticated, authorized, logout } = user.actions;

export const isAuthenticatedSelector = (state: RootState) => Boolean(state.user.psuid);
export const isAuthorizedSelector = (state: RootState) => Boolean(state.user.currentUser.uid);
export const userSelector = (state: RootState) => state.user.currentUser;

const SCOPES = [YandexAuthScope.Avatar, YandexAuthScope.Info, YandexAuthScope.Email];

export const authenticate = (afterLogin?: () => void): AppThunk => async(dispatch, getState) => {
    try {
        const {
            user: { psuid },
        } = getState();
        const psuidInfo = await identify();

        if (psuid && psuid !== psuidInfo.payload.psuid) {
            dispatch(cleanup());
        }

        dispatch(authenticated({ token: psuidInfo.jwtToken, psuid: psuidInfo.payload.psuid }));

        afterLogin?.();
    } catch (err) {
        console.error(err);
        if (err.message !== 'user not logged') {
            alert('Не удалось войти. Попробуйте ещё раз');
        }
    }
};

export const authorize = (): AppThunk => async dispatch => {
    try {
        const {
            userInfo,
            tokenInfo: { authorizedScopes },
        } = await authorizeScopes(SCOPES);

        dispatch(authorized({ user: userInfo.payload, scopes: authorizedScopes }));
    } catch (err) {
        console.error(err);
        if (!['authorization denied', 'authorization cancelled'].includes(err.message)) {
            alert('Не удалось получить информацию о пользователе');
        }
    }
};

export const login = (): AppThunk => async dispatch => {
    await dispatch(
        authenticate(() => {
            dispatch(fetchOrders());
        })
    );
};

export const checkUser = (): AppThunk => async(dispatch, getState) => {
    const oldPsuid = getState().user.psuid;

    try {
        const user = await getCurrentUserId();
        const isUserChanged = oldPsuid && user?.payload.psuid !== oldPsuid;

        if (isUserChanged) {
            dispatch(cleanup());
        }

        if (!user) {
            return;
        }

        const psuid = user.payload.psuid;

        // Если пользователь разлогинился, то не логиним его автоматически
        if (psuid === getState().user.loggedOutPsuid) {
            return;
        }

        dispatch(authenticated({ token: user.jwtToken, psuid }));
        dispatch(fetchOrders());
    } catch (err) {
        console.error(err);

        if (oldPsuid) {
            dispatch(cleanup());
        }
    }
};

const persistConfig = getPersistConfig<User>('user');
export default persistReducer(persistConfig, user.reducer);
