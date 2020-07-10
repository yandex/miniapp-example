export type YandexTransactionPushToken = {
    jwtToken: string;
    pushToken: string;
};

export async function getTransactionPushToken(paymentToken: string) {
    return window.yandex.app.push.getPushTokenForTransaction(paymentToken);
}
