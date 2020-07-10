import { EcommerceItem, YMetrikaInitParams, YMetrikaVisitParams } from './metrika/types';
import {
    YandexAuthApiInfo,
    YandexAuthInfo,
    YandexAuthPSUIDInfo,
    YandexAuthScope
} from './account-manager';
import { YandexTransactionPushToken } from './push-notification';

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
        yandex: {
            app: {
                reportGoalReached: (goal: string, data: object) => Promise<void>;
                auth: {
                    identify: (clientId: string) => Promise<YandexAuthPSUIDInfo>;
                    getCurrentUserId: (clientId: string) => Promise<YandexAuthPSUIDInfo | null>;
                    authorize: (clientId: string, scopes?: YandexAuthScope[]) => Promise<YandexAuthApiInfo>;
                    updateUserInfo: (authToken: string) => Promise<YandexAuthInfo>;
                },
                push: {
                    getPushTokenForTransaction: (paymentToken: string) => Promise<YandexTransactionPushToken | null>
                }
            };
        }
        dataLayer: EcommerceItem[];
    }
}
