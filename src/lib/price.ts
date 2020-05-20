import { Currency } from './api/fragments/ticket';

const currencySymbol: { [key in Currency]: string } = {
    rub: '₽',
    usd: '$',
};

export function getCurrencySymbol(currency: Currency) {
    return currencySymbol[currency];
}
