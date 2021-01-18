import { AppError, AppErrorCode } from '../error';
import { callJsApi } from './utils';

enum YandexAuthErrorName {
    NotLoggedIn = 'AuthErrorCode::ERROR_NOT_LOGGED_IN',
    AuthorizationDenied = 'AuthErrorCode::ERROR_AUTHORIZATION_DENIED',
    AuthorizationCancelled = 'AuthErrorCode::ERROR_AUTHORIZATION_CANCELLED',
}

export enum YandexAuthScope {
    Info = 'login:info',
    Email = 'login:email',
    Avatar = 'login:avatar',
}

export type UserInfo = {
    uid?: string | number;
    name?: string;
    login?: string;
    email?: string;
    avatar_id?: string;
    display_name?: string;
}

type PSUIDPayload = {
    psuid: string;
}

type JWTPayload = {
    iss: string;
    iat: number;
    jti: string;
    exp: number;
}

export type YandexAuthUserInfo = {
    payload: JWTPayload & PSUIDPayload & UserInfo;
    jwtToken: string;
}

export type YandexAuthPSUIDInfo = {
    payload: JWTPayload & PSUIDPayload;
    jwtToken: string;
}

export type YandexAuthInfo = {
    userInfo: YandexAuthUserInfo;
    tokenInfo: {
        authToken: string;
        authorizedScopes: Array<YandexAuthScope>;
    };
}

export const CLIENT_ID = '9e445c9aacec4266bf265302facb8293';

export async function identify(): Promise<YandexAuthPSUIDInfo> {
    try {
        return await callJsApi({
            name: 'window.yandex.app.auth.identify',
            args: [CLIENT_ID],
            scope: window?.yandex?.app?.auth,
            method: 'identify',
        });
    } catch (err) {
        const { name } = err;

        if (name === YandexAuthErrorName.NotLoggedIn) {
            throw new AppError(AppErrorCode.JsApiCancelled, 'User not logged.');
        }

        throw err;
    }
}

export async function authorize(scopes?: Array<YandexAuthScope>): Promise<YandexAuthInfo> {
    try {
        return await callJsApi({
            name: 'window.yandex.app.auth.authorize',
            args: [CLIENT_ID, scopes],
            scope: window?.yandex?.app?.auth,
            method: 'authorize',
        });
    } catch (err) {
        const { name } = err;

        if (name === YandexAuthErrorName.AuthorizationDenied) {
            throw new AppError(AppErrorCode.JsApiDenied, 'Authorization denied.');
        }

        if ([YandexAuthErrorName.NotLoggedIn, YandexAuthErrorName.AuthorizationCancelled].includes(name)) {
            throw new AppError(AppErrorCode.JsApiCancelled, 'Authorization cancelled.');
        }

        throw err;
    }
}

export async function getCurrentUserId(): Promise<YandexAuthPSUIDInfo | null> {
    try {
        return await callJsApi({
            name: 'window.yandex.app.auth.getCurrentUserId',
            args: [CLIENT_ID],
            scope: window?.yandex?.app?.auth,
            method: 'getCurrentUserId',
        });
    } catch (err) {
        const { name } = err;

        if (name === YandexAuthErrorName.NotLoggedIn) {
            throw new AppError(AppErrorCode.JsApiCancelled, 'User not logged.');
        }

        throw err;
    }
}
