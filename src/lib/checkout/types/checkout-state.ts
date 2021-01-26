export type YandexCheckoutDatetimeOptionState = {
    id: string;
    timeOption?: {
        id: string;
    };
};

export type YandexCheckoutCityState = {
    city: string;
    region?: string; // Область/округ/регион
    country?: string;
}

export type YandexCheckoutOrderShippingAddressState = {
    rawAddress: string; // Ввод пользователя
    district?: string; // Район города
    street?: string;
    house?: string;
    porch?: string;
    intercom?: string;
    apartment?: string;
    floor?: string;
    postalCode?: string;
    comment?: string;
};

export type YandexCheckoutOrderState = {
    // Уникальный идентфикатор заказа.
    id: string;

    // Город, если заполнен пользователем
    city?: YandexCheckoutCityState,

    // Идентификатор способа доставки, если выбран
    shippingOption?: {
        id: string;
    };

    // Адрес доставки, если заполнен пользователем
    shippingAddress?: YandexCheckoutOrderShippingAddressState;

    // Идентификатор пункта самовывоза, если выбран
    pickupOption?: {
        id: string;
    };

    // Идентификатор даты и времени доставки, если выбраны
    datetimeOption?: YandexCheckoutDatetimeOptionState;
};

export type YandexCheckoutPayerDetailsState = Record<string, string | undefined>;

export type YandexCheckoutState = {
    // Коментарий к заказу
    comment?: string;

    // Значение поля с промокодом
    promoCode?: string;

    // Контакты покупателя
    // Note: поле доступны только после перехода к оплате (событие `paymentStart`)
    payerDetails?: YandexCheckoutPayerDetailsState;

    orders: Array<YandexCheckoutOrderState>;

    // Выбранный способ оплаты, если выбран
    paymentOption?: {
        // Выбранный тип оплаты. Реквизиты банковской карты не доступны.
        type: string;

        // Дополнительные данные для выбранного способа оплаты
        data?: object;
    };
};
