import { callJsApi } from './utils';

export type YandexPushTokenForTransaction = {
    jwtToken: string;
    pushToken: string;
};

export function getPushTokenForTransaction(paymentToken: string): Promise<YandexPushTokenForTransaction | null> {
    return callJsApi({
        name: 'window.yandex.app.push.getPushTokenForTransaction',
        args: [paymentToken],
        scope: window?.yandex?.app?.push,
        method: 'getPushTokenForTransaction',
    });
}
