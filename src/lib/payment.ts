import { UserInfo } from './account-manager';
import { CreateOrderResponse } from './api/types';

interface YandexPaymentMethodData extends PaymentMethodData {
    supportedMethods: 'yandex',
    data: {
        userEmail?: string;
        paymentToken: string;
    };
}

export enum PaymentError {
    NotSupported = 'not_supported',
    Cancelled = 'cancelled',
    Shown = 'shown'
}

const ErrorsMap: Record<string, PaymentError> = {
    '[NOT_STARTED]: ': PaymentError.Cancelled,
    'Already shown': PaymentError.Shown,
};

export async function processNativePayment(orderInfo: CreateOrderResponse, user: UserInfo) {
    const { paymentToken, cost, id } = orderInfo;

    const yandexMethodData: YandexPaymentMethodData = {
        supportedMethods: 'yandex',
        data: {
            userEmail: user.email,
            paymentToken: paymentToken
        }
    };

    const details: PaymentDetailsInit = {
        id: id.toString(),
        total: {
            label: 'Покупка билета',
            amount: {
                currency: 'RUB',
                value: cost.toString()
            }
        }
    };

    if (!window.PaymentRequest) {
        throw new Error(PaymentError.NotSupported);
    }

    try {
        const request = new PaymentRequest([yandexMethodData], details);
        const canMakePayment = await request.canMakePayment();

        if (!canMakePayment) {
            throw new Error(PaymentError.NotSupported);
        }

        const response = await request.show();
        await response.complete('success');
    } catch (err) {
        const message = err.message as string;
        const mappedError = ErrorsMap[message];

        throw mappedError ? new Error(mappedError) : err;
    }
}
