export type Currency = 'rub' | 'usd';

export type Price = {
    currency: Currency;
    min: number | null;
    max: number | null;
};

export type Ticket = {
    id: string | null;
    price: Price | null;
};
