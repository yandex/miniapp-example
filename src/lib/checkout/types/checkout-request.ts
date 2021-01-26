import { YandexCheckoutDetails, YandexCheckoutDetailsUpdate } from './checkout-details';
import { YandexCheckoutOptions } from './checkout-options';
import { YandexCheckoutState } from './checkout-state';

export type YandexCheckoutEvent =
    | 'restoreState'
    | 'cityChange'
    | 'shippingOptionChange'
    | 'shippingAddressChange'
    | 'pickupOptionChange'
    | 'datetimeOptionChange'
    | 'promoCodeChange'
    | 'paymentOptionChange'
    | 'paymentStart'
    | 'paymentError';

export type YandexCheckoutRequestUpdateEvent = {
    // Тип события, для которого вызван обработчик
    type: YandexCheckoutEvent;

    // Состояние формы на момент наступления события
    checkoutState: YandexCheckoutState;

    // Метод для обновления формы заказа
    updateWith(details: null | YandexCheckoutDetailsUpdate | Promise<YandexCheckoutDetailsUpdate | null>): void;
};

export interface YandexCheckoutRequest {
    // Открытие диалога с формой заказа
    show(): Promise<YandexCheckoutState>;

    // Добавление/удаление обработчиков событий
    addEventListener(
        event: YandexCheckoutEvent,
        listener: (event: YandexCheckoutRequestUpdateEvent) => void
    ): void;
    removeEventListener(
        event: YandexCheckoutEvent,
        listener: (event: YandexCheckoutRequestUpdateEvent) => void
    ): void;

    new (details: YandexCheckoutDetails, options?: YandexCheckoutOptions): YandexCheckoutRequest;
}
