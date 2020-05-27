import { Event } from '../api/fragments/event';

import { CurrencyCode } from './types';

function getProductFromEvent(event: Event) {
    const price = event.tickets?.[0]?.price?.min;

    return {
        id: event.id,
        name: event.title,
        category: event.type.name,
        price: price ? price / 100 : undefined
    };
}

function getEventCurrency(event: Event) {
    return event.tickets?.[0]?.price?.currency.toUpperCase() as CurrencyCode | undefined;
}

export function logProductView(event: Event) {
    window.dataLayer.push({
        ecommerce: {
            currencyCode: getEventCurrency(event),
            detail: {
                products: [getProductFromEvent(event)]
            }
        }
    });
}

export function logProductAdd(event: Event) {
    window.dataLayer.push({
        ecommerce: {
            currencyCode: getEventCurrency(event),
            add: {
                products: [getProductFromEvent(event)]
            }
        }
    });
}

export function logProductPurchase(event: Event, orderId: number) {
    window.dataLayer.push({
        ecommerce: {
            currencyCode: getEventCurrency(event),
            purchase: {
                actionField: {
                    id: orderId.toString(),
                },
                products: [getProductFromEvent(event)]
            }
        }
    });
}
