import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { cleanup } from '../actions';
import { AppErrorCode } from '../../lib/error';
import { fetchUserInfo } from '../../lib/api';
import { getPersistConfig } from '../helpers/persist';
import { getOauthToken, redirectToOauthAuthorize } from '../../lib/oauth';
import {
    identify as jsApiIdentify,
    authorize as jsApiAuthorize,
    UserInfo,
    YandexAuthScope,
    getCurrentUserId,
} from '../../lib/js-api/auth';
import { fetchOrders } from './order';
import { AppThunk, RootState } from '..';

export type User = {
    persist: {
        currentUser: UserInfo;
        psuid?: string;
        jwtToken?: string;
        oauthToken?: string;
        loggedOutPsuid?: string;
    },
    nonpersist: {
        isSessionLoggedOut?: boolean;
    },
};

const initialState: User = {
    persist: {
        currentUser: {},
    },
    nonpersist: {},
};

const user = createSlice({
    name: 'user',
    initialState,
    reducers: {
        authenticated(state, action: PayloadAction<{ oauthToken: string } | { psuid: string; jwtToken: string }>) {
            const payload = action.payload;

            if ('psuid' in payload) {
                state.persist.psuid = payload.psuid;
                state.persist.jwtToken = payload.jwtToken;
            } else {
                state.persist.oauthToken = payload.oauthToken;
            }

            delete state.persist.loggedOutPsuid;
            delete state.nonpersist.isSessionLoggedOut;
        },
        authorized(state, action: PayloadAction<{ user: UserInfo }>) {
            state.persist.currentUser = action.payload.user;
        },
        logout(state) {
            return {
                persist: {
                    ...initialState.persist,
                    loggedOutPsuid: state.persist.psuid,
                },
                nonpersist: {
                    ...initialState.nonpersist,
                    isSessionLoggedOut: true,
                },
            };
        },
    },
    extraReducers: builder => {
        builder.addCase(cleanup, () => initialState);
    },
});

export const { authenticated, authorized, logout } = user.actions;

const loggedOutPsuidSelector = (state: RootState) => state.user.persist.loggedOutPsuid;
const isSessionLoggedOutSelector = (state: RootState) => Boolean(state.user.nonpersist.isSessionLoggedOut);
export const userSelector = (state: RootState) => state.user.persist.currentUser;
export const psuidSelector = (state: RootState) => state.user.persist.psuid;
export const jwtTokenSelector = (state: RootState) => state.user.persist.jwtToken;
export const oauthTokenSelector = (state: RootState) => state.user.persist.oauthToken;
export const isAuthorizedSelector = (state: RootState) => Boolean(state.user.persist.currentUser.uid);
export const isAuthenticatedSelector = createSelector(
    jwtTokenSelector,
    oauthTokenSelector,
    (jwtToken, oauthSelector) => Boolean(jwtToken ?? oauthSelector)
);

const SCOPES = [YandexAuthScope.Avatar, YandexAuthScope.Info, YandexAuthScope.Email];

const oauthUpdateUserAndOrders = (oauthToken: string): AppThunk => async dispatch => {
    dispatch(authenticated({ oauthToken }));
    dispatch(fetchOrders());

    try {
        const userInfo = await fetchUserInfo(oauthToken);

        dispatch(authorized({ user: userInfo }));
    } catch (err) {
        console.error(err);
        alert('Не удалось получить информацию о пользователе');
    }
};

const oauthCheckUser = (): AppThunk => async(dispatch, getState) => {
    const state = getState();

    const oldOauthToken = oauthTokenSelector(state);
    const isSessionLoggedOut = isSessionLoggedOutSelector(state);

    // Если пользователь разлогинился, то не логиним его автоматически
    if (isSessionLoggedOut) {
        return;
    }

    try {
        const oauthToken = getOauthToken({ withError: true });

        if (!oauthToken) {
            if (oldOauthToken) {
                dispatch(oauthUpdateUserAndOrders(oldOauthToken));
            }

            return;
        }

        const isUserChanged = oldOauthToken && oldOauthToken !== oauthToken;

        if (isUserChanged) {
            dispatch(cleanup());
        }

        dispatch(oauthUpdateUserAndOrders(oauthToken));
    } catch (err) {
        const { code } = err;

        if (oldOauthToken) {
            dispatch(cleanup());
        }

        switch (code) {
            case AppErrorCode.OauthAccessDenied:
                return console.warn(err);
            default:
                console.error(err);
        }
    }
};

export const authenticate = (afterLogin?: () => void): AppThunk => async(dispatch, getState) => {
    try {
        const psuid = psuidSelector(getState());
        const psuidInfo = await jsApiIdentify();

        if (psuid && psuid !== psuidInfo.payload.psuid) {
            dispatch(cleanup());
        }

        dispatch(authenticated({ jwtToken: psuidInfo.jwtToken, psuid: psuidInfo.payload.psuid }));

        afterLogin?.();
    } catch (err) {
        const { code } = err;

        switch (code) {
            case AppErrorCode.JsApiCancelled:
                return console.warn(err);
            case AppErrorCode.JsApiMethodNotAvailable:
                return redirectToOauthAuthorize();
        }

        console.error(err);
        alert('Не удалось войти. Попробуйте ещё раз');
    }
};

export const authorize = (): AppThunk => async dispatch => {
    try {
        const { userInfo } = await jsApiAuthorize(SCOPES);

        dispatch(authorized({ user: userInfo.payload }));
    } catch (err) {
        const { code } = err;

        switch (code) {
            case AppErrorCode.JsApiDenied:
            case AppErrorCode.JsApiCancelled:
                return console.warn(err);
            case AppErrorCode.JsApiMethodNotAvailable:
                return redirectToOauthAuthorize();
        }

        console.error(err);
        alert('Не удалось получить информацию о пользователе');
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
    const oldPsuid = psuidSelector(getState());

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
        const loggedOutPsuid = loggedOutPsuidSelector(getState());

        // Если пользователь разлогинился, то не логиним его автоматически
        if (psuid === loggedOutPsuid) {
            return;
        }

        dispatch(authenticated({ jwtToken: user.jwtToken, psuid }));
        dispatch(fetchOrders());
    } catch (err) {
        const { code } = err;

        if (oldPsuid) {
            dispatch(cleanup());
        }

        switch (code) {
            case AppErrorCode.JsApiCancelled:
                return console.warn(err);
            case AppErrorCode.JsApiMethodNotAvailable:
                return dispatch(oauthCheckUser());
            default:
                console.error(err);
        }
    }
};

const persistConfig = getPersistConfig<User>('user', { whitelist: ['persist'] });
export default persistReducer(persistConfig, user.reducer);
