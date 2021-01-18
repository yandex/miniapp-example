import { AppError, AppErrorCode } from './error';
import { UserInfo, CreateOrderResponse } from './api/types';

interface YandexPaymentMethodData extends PaymentMethodData {
    supportedMethods: 'yandex',
    data: {
        userEmail?: string;
        paymentToken: string;
    };
}

export async function processNativePayment(orderInfo: CreateOrderResponse, userInfo: UserInfo) {
    const { paymentToken, cost, id } = orderInfo;
    const { email: userEmail } = userInfo;

    const yandexMethodData: YandexPaymentMethodData = {
        supportedMethods: 'yandex',
        data: {
            userEmail,
            paymentToken,
        }
    };

    const details: PaymentDetailsInit = {
        id: id.toString(),
        total: {
            label: 'Покупка билета',
            amount: {
                value: cost.toString(),
                currency: 'RUB',
            }
        }
    };

    if (!window.PaymentRequest) {
        throw new AppError(
            AppErrorCode.JsApiMethodNotAvailable,
            'window.PaymentRequest is not available in this browser version.'
        );
    }

    try {
        const request = new PaymentRequest([yandexMethodData], details);
        const canMakePayment = await request.canMakePayment();

        if (!canMakePayment) {
            throw new AppError(AppErrorCode.JsApiMethodNotAvailable, 'request.canMakePayment() returns false.');
        }

        const response = await request.show();
        await response.complete('success');
    } catch (err) {
        const { message } = err;

        if (message.includes('[NOT_STARTED]')) {
            throw new AppError(AppErrorCode.JsApiCancelled, 'window.PaymentRequest canceled.');
        }

        if (message.includes('Already called show')) {
            throw new AppError(AppErrorCode.JsApiAlreadyShown, 'window.PaymentRequest already shown.');
        }

        throw err;
    }
}
