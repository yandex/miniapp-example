export type YMetrikaVisitParams = object | object[];

export type YMetrikaInitParams = {
    defer?: boolean;
    clickmap?: boolean;
    trackLinks?: boolean;
    accurateTrackBounce?: boolean;
    webvisor?: boolean;
    trackHash?: boolean;
    params?: YMetrikaVisitParams;
    ecommerce?: string;
};

export type Product = {
    id: string;
    name?: string;
    brand?: string;
    category?: string;
    coupon?: string;
    position?: number;
    price?: number;
    quantity?: number;
    variant?: string;
}

export type Action = {
    products: Product[];
}

export type ActionField = {
    id: string;
    coupon?: string;
    goal_id?: number; // eslint-disable-line camelcase
    revenue?: number;
}

export type Purchase = Action & {
    actionField: ActionField;
}

export type CurrencyCode = 'RUB' | 'USD'

type EcommerceValueBase = {
    currencyCode?: CurrencyCode;
}

export type EcommerceValueAdd = EcommerceValueBase & {
    add: Action;
}

export type EcommerceValueRemove = EcommerceValueBase & {
    remove: Action;
}

export type EcommerceValueDetail = EcommerceValueBase & {
    detail: Action;
}

export type EcommerceValuePurchase = EcommerceValueBase & {
    purchase: Purchase;
};

export type EcommerceItem = {
    ecommerce: EcommerceValueAdd
        | EcommerceValueRemove
        | EcommerceValueDetail
        | EcommerceValuePurchase;
}
