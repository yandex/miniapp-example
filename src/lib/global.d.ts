import { YandexTransactionPushToken } from './js-api/push';
import { YandexProfileData, YandexProfileField } from './js-api/autofill';
import { YandexAuthInfo, YandexAuthPSUIDInfo, YandexAuthScope } from './js-api/auth';
import { EcommerceItem, YMetrikaInitParams, YMetrikaVisitParams } from './metrika/types';

declare global {
    interface Window {
        ym(counterId: number, action: 'init', params?: YMetrikaInitParams): void;
        ym(counterId: number, action: 'hit', url: string, options?: { params?: YMetrikaVisitParams }): void;
        ym(
            counterId: number,
            action: 'reachGoal',
            target: string,
            params?: YMetrikaVisitParams,
            cb?: () => void,
            ctx?: object
        ): void;
        dataLayer: Array<EcommerceItem>;
        yandex?: {
            app?: {
                auth?: {
                    identify?: (clientId: string) => Promise<YandexAuthPSUIDInfo>;
                    authorize?: (clientId: string, scopes?: Array<YandexAuthScope>) => Promise<YandexAuthInfo>;
                    updateUserInfo?: (authToken: string) => Promise<YandexAuthInfo>;
                    getCurrentUserId?: (clientId: string) => Promise<YandexAuthPSUIDInfo | null>;
                };
                push?: {
                    getPushTokenForTransaction?: (paymentToken: string) => Promise<YandexTransactionPushToken | null>;
                };
                reportGoalReached?: (goal: string, data: object) => Promise<void>;
            };
            autofill?: {
                getProfileData?: (profileFields: Array<YandexProfileField>) => Promise<YandexProfileData>;
            };
        };
    }
}
