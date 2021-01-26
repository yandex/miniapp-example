export type YandexCheckoutCoordinates = {
    lat: number;
    lon: number;
}

export type YandexCheckoutCartItemImageSize = {
    width: number;
    height: number;
};

export type YandexCheckoutCartItemImage = YandexCheckoutCartItemImageSize & {
    url: string;
};

export type YandexCheckoutPrice = {
    value: number; // Целое число в копейках
    currency: string; // Код валюты по ISO 4217
};

export type YandexCheckoutCartItem = {
    title: string;
    amount: YandexCheckoutPrice;
    count: number;
    image?: Array<YandexCheckoutCartItemImage>;
};

export type YandexCheckoutCartDetail = { label: string; } & (
    | { amount?: YandexCheckoutPrice; /* Для вывода отформатированной цены */ }
    | { value?: string; /* Для вывода кастомного текста */ }
);

export type YandexCheckoutShippingOption = {
    id: string;
    label: string;
    amount: YandexCheckoutPrice;
    datetimeEstimate?: string; // Примерный срок доставки выбранным методом
    selected?: true; // Предвыбранный способ доставки
};

export type YandexCheckoutPickupOption = {
    id: string;
    label: string;
    address: string;
    coordinates?: YandexCheckoutCoordinates;
    selected?: true; // Предвыбранная точка самовывоза
};

export type YandexCheckoutTimeOption = {
    id: string;
    label: string;
    amount: YandexCheckoutPrice;
    selected?: true; // Предвыбранное время доставки
};

export type YandexCheckoutDatetimeOption = {
    id: string;
    date: string; // Дата в формате ISO 8601
    timeOptions: Array<YandexCheckoutTimeOption>;
    selected?: true; // Предвыбранная дата доставки
};

export type YandexCheckoutTotalAmountDetail = {
    label: string;
    amount: YandexCheckoutPrice;
};

export type YandexCheckoutTotalAmount = {
    amount: YandexCheckoutPrice;
    details?: Array<YandexCheckoutTotalAmountDetail> | null;
};

export type YandexCheckoutPayerDetail = {
    // На данный момент поддерживается:
    // – 'name' - имя
    // – 'email' - e-mail
    // – 'phone' - телефон
    type: string;

    // Сделать поле обязательным для заполнения
    require?: boolean;
};

export type YandexCheckoutPaymentOption = {
    // На данный момент поддерживается:
    // – 'offline-cash' - оплата наличными
    // – 'offline-card' - картой при получении
    // – 'yandex-payments' - онлайн оплата через Яндекс Оплату
    // – 'online-external-payments' - онлайн оплата через внешние сервисы оплаты
    type: string;

    // Дополнительные настройки для способа оплаты, зависят от типа
    data?: object;
};

export type YandexCheckoutOrder = {
    // Уникальный идентфикатор заказа. Обязательное поле.
    id: string;

    // Состав корзины, обязательное поле, минимум один элемент в массиве
    cartItems: Array<YandexCheckoutCartItem>;

    // Дополнительная информация о корзине (вес товаров и тд)
    cartDetails?: Array<YandexCheckoutCartDetail> | null;

    // Способы доставки
    shippingOptions?: Array<YandexCheckoutShippingOption> | null;

    // Запросить ввод города
    requestCity?: boolean;

    // Запросить ввод адреса доставки
    requestShippingAddress?: boolean;

    // Адреса точек для самовывоза
    pickupOptions?: Array<YandexCheckoutPickupOption> | null;

    // Варианты даты и времени доставки
    datetimeOptions?: Array<YandexCheckoutDatetimeOption> | null;
};

export type YandexCheckoutPayerDetailsErrors = Record<string, string | undefined | null>;

export type YandexCheckoutValidationErrors = {
    // Общая ошибка для всей формы заказа
    error?: string | null;

    // Ошибки заполнения контактов
    payerDetails?: YandexCheckoutPayerDetailsErrors | null;

    // Ошибки валидации промокода
    promoCode?: string | null;

    orders?: Array<YandexCheckoutOrderErrors>;
}

export type YandexCheckoutOrderShippingAddressErrors = {
    address?: string | null; // Валидация улицы, дом
}

export type YandexCheckoutOrderErrors = {
    // Уникальный идентфикатор заказа.
    id: string;

    // Ошибки заполнения города
    city?: string | null;

    // Ошибки заполнения адреса доставки
    shippingAddress?: YandexCheckoutOrderShippingAddressErrors | null;
};

export type YandexCheckoutPromoCode = {
    request: boolean; // Показать поле для ввода промокода
    value?: string | null; // Активный промокод
    amount?: YandexCheckoutPrice | null; // Скидка по активному промокоду
}

export type YandexCheckoutDetails = {
    // Итоговая стоимость заказа, обязательное поле
    total: YandexCheckoutTotalAmount;

    // Способы оплаты заказа
    // – минимум один элемент в списке
    // – каждый тип не может быть использовать больше одного раза
    /**
     * @minItems 1
     * @uniqueItems true
     */
    paymentOptions: Array<YandexCheckoutPaymentOption>;

    // Настройки полей с контактами пользователя
    /**
     * @uniqueItems true
     */
    payerDetails?: Array<YandexCheckoutPayerDetail>,

    // Показать поле для комментария к заказу
    requestOrderComment?: boolean;

    // Скидка по промокоду
    promoCode?: YandexCheckoutPromoCode | null;

    // Должен быть минимум один элемент в списке
    /**
     * @minItems 1
     */
    orders: Array<YandexCheckoutOrder>;

    // Ошибки валидации полей форма заказа, которые будут показаны пользователю.
    // Переход к оплате будет заблокирован при наличии ошибки валидации хотя бы в одном из полей.
    validationErrors?: YandexCheckoutValidationErrors;
};

export type YandexCheckoutDetailsUpdate = Partial<Omit<YandexCheckoutDetails, 'orders'>> & {
    orders?: Array<Omit<YandexCheckoutOrder, 'cartItems'> & {
        cartItems?: Array<YandexCheckoutCartItem>;
    }>;
};
