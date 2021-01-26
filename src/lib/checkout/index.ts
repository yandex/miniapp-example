import { Event } from '../api/fragments/event';
import { AppError, AppErrorCode } from '../error';
import {
    YandexCheckoutState,
    YandexCheckoutRequest,
    YandexCheckoutDetails,
    YandexCheckoutOptions,
    YandexCheckoutTotalAmount,
    YandexCheckoutPaymentOption,
    YandexCheckoutShippingOption,
    YandexCheckoutOrderShippingAddressState,
} from './types';

enum PaymentOption {
    OfflineCash = 'offline-cash',
    OfflineCard = 'offline-card',
    YandexPayments = 'yandex-payments',
    OnlineExternalPayments = 'online-external-payments',
}

enum ShippingOption {
    Mail = 'mail',
    Courier = 'courier',
}

const CURRENCY = 'RUB';
const PUBLIC_URL = process.env.PUBLIC_URL ?? '';
const DEFAULT_SHIPPING_ID = ShippingOption.Courier;
const DEFAULT_PAYMENT_FORM_URL =
    'https://sdelano.net/browser/cards/with3ds?redirect_url=https%3A%2F%2Fcheckout.tap.yandex.ru%2Fonline-external-payments%2Fsuccess';

const CHECKOUT_STORAGE_KEY = 'miniapp_example_native_checkout';
const CHECKOUT_SEARCH_PARAM = 'native_checkout';
const CHECKOUT_SEARCH_POSITIVE_PARAMS = new Set(['1', 'on', 'true']);

export const isCheckoutRequestAvailable = (function() {
    const searchParams = new URLSearchParams(window.location.search);

    const checkoutSearchParam = searchParams.get(CHECKOUT_SEARCH_PARAM);
    const checkoutSearchParamCached = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);
    const checkoutParam = checkoutSearchParam ?? checkoutSearchParamCached ?? '';

    const isCheckoutEnable = CHECKOUT_SEARCH_POSITIVE_PARAMS.has(checkoutParam);
    const isCheckoutAvailable = Boolean(window.YandexCheckoutRequest);

    if (checkoutSearchParam) {
        window.localStorage.setItem(CHECKOUT_STORAGE_KEY, checkoutSearchParam);
    }

    return isCheckoutEnable && isCheckoutAvailable;
})();

function getShippingOption(shippingOptionId: ShippingOption): YandexCheckoutShippingOption;
function getShippingOption(shippingOptionId: string): YandexCheckoutShippingOption | undefined;
function getShippingOption(shippingOptionId: string): YandexCheckoutShippingOption | undefined {
    switch (shippingOptionId) {
        case ShippingOption.Mail:
            return {
                id: ShippingOption.Mail,
                label: 'Почта России',
                datetimeEstimate: '6-7 дней',
                amount: {
                    value: 0,
                    currency: CURRENCY,
                },
            };
        case ShippingOption.Courier:
            return {
                id: ShippingOption.Courier,
                label: 'Курьер',
                datetimeEstimate: '3-4 дня',
                amount: {
                    value: 10000,
                    currency: CURRENCY,
                },
            };
    }
}

export function getSelectedShippingAddress(
    orderId: string,
    checkoutState: YandexCheckoutState
): YandexCheckoutOrderShippingAddressState | undefined {
    const order = checkoutState.orders.find(({ id }) => id === orderId);
    const selectedShippingAddress = order?.shippingAddress;

    return selectedShippingAddress;
}

export function getSelectedShippingOption(
    orderId: string,
    checkoutState: YandexCheckoutState
): YandexCheckoutShippingOption | undefined {
    const order = checkoutState.orders.find(({ id }) => id === orderId);
    const selectedShippingOptionId = order?.shippingOption?.id;

    if (selectedShippingOptionId) {
        return getShippingOption(selectedShippingOptionId);
    }
}

export function getCheckoutTotalAmount(shippingOptionId: string, event: Event): YandexCheckoutTotalAmount {
    const { tickets: eventTickets } = event;

    const eventValue = eventTickets?.[0]?.price?.min ?? 0;
    const deliveryValue = getShippingOption(shippingOptionId)?.amount.value ?? 0;

    const totalAmount: YandexCheckoutTotalAmount = {
        amount: {
            value: eventValue + deliveryValue,
            currency: CURRENCY,
        },
        details: null,
    };

    if (deliveryValue > 0) {
        totalAmount.details = [
            {
                label: 'Билеты',
                amount: {
                    value: eventValue,
                    currency: CURRENCY,
                },
            },
            {
                label: 'Доставка',
                amount: {
                    value: deliveryValue,
                    currency: CURRENCY,
                },
            },
        ];
    }

    return totalAmount;
}

export function getCheckoutShippingOptions(defaultShippingOptionId: string): Array<YandexCheckoutShippingOption> {
    return [ShippingOption.Mail, ShippingOption.Courier].map(id => {
        const shippingOption = getShippingOption(id);

        if (shippingOption.id === defaultShippingOptionId) {
            shippingOption.selected = true;
        }

        return shippingOption;
    });
}

// Модульная переменная, в которой хранится информация о доступности внешних онлайн оплат
let isOnlineExternalPaymentsAvailable: boolean = true;

export function getCheckoutPaymentOptions(paymentToken?: string): Array<YandexCheckoutPaymentOption> {
    const yandexPaymentsData = typeof paymentToken === 'string' ? { paymentToken } : undefined;
    const checkoutPaymentOptions: Array<YandexCheckoutPaymentOption> = [
        { type: PaymentOption.OfflineCash },
        { type: PaymentOption.OfflineCard },
        { type: PaymentOption.YandexPayments, data: yandexPaymentsData },
    ];

    if (isOnlineExternalPaymentsAvailable) {
        checkoutPaymentOptions.push({
            type: PaymentOption.OnlineExternalPayments,
            data: { paymentFormUrl: DEFAULT_PAYMENT_FORM_URL },
        });
    }

    return checkoutPaymentOptions;
}

function getCheckoutDetails(orderId: string, event: Event): YandexCheckoutDetails {
    const { title: eventTitle, image: eventImage } = event;
    const { touchPrimary } = eventImage ?? {};

    const total = getCheckoutTotalAmount(DEFAULT_SHIPPING_ID, event);
    const paymentOptions = getCheckoutPaymentOptions();
    const shippingOptions = getCheckoutShippingOptions(DEFAULT_SHIPPING_ID);

    return {
        total,
        orders: [
            {
                id: orderId,
                requestCity: true,
                requestShippingAddress: true,
                cartItems: [
                    {
                        title: eventTitle,
                        count: 1,
                        image: touchPrimary && [
                            {
                                url: touchPrimary.url,
                                width: touchPrimary.width,
                                height: touchPrimary.height,
                            },
                        ],
                        amount: total.amount,
                    },
                ],
                shippingOptions,
            },
        ],
        payerDetails: [
            { type: 'name', require: true },
            { type: 'phone', require: true },
            { type: 'email', require: true },
        ],
        paymentOptions,
    };
}

function getCheckoutOptions(): YandexCheckoutOptions {
    return {
        shopName: 'MiniApp Example',
        shopIcon: `${PUBLIC_URL}/logo192.png`,
    };
}

function getCheckoutRequest(orderId: string, event: Event): YandexCheckoutRequest {
    if (!window.YandexCheckoutRequest) {
        throw new AppError(AppErrorCode.JsApiMethodNotAvailable, 'window.YandexCheckoutRequest is undefined.');
    }

    const checkoutDetails = getCheckoutDetails(orderId, event);
    const checkoutOptions = getCheckoutOptions();

    return new window.YandexCheckoutRequest(checkoutDetails, checkoutOptions);
}

export function createCheckoutRequest(orderId: string, event: Event): YandexCheckoutRequest {
    try {
        return getCheckoutRequest(orderId, event);
    } catch (err) {
        const { name, message } = err;

        const isTypeError = name === 'TypeError';
        const isOnlineExternalPaymentsValidationError = message.includes(
            "'online-external-payments' is not a valid enum"
        );

        // Если реализация внешних оплат недоступна, тогда пытаемся открыть Чекаут без них
        if (isTypeError && isOnlineExternalPaymentsValidationError) {
            isOnlineExternalPaymentsAvailable = false;

            return getCheckoutRequest(orderId, event);
        }

        throw err;
    }
}
