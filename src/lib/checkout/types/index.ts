import { YandexCheckoutRequest } from './checkout-request';

declare global {
    interface Window {
        YandexCheckoutRequest?: YandexCheckoutRequest;
    }
}

export * from './checkout-request';
export * from './checkout-details';
export * from './checkout-options';
export * from './checkout-state';
