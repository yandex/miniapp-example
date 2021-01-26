import { createSelector, createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { Event } from '../../lib/api/fragments/event';
import { cleanup } from '../actions';
import { AppErrorCode } from '../../lib/error';
import { processNativePayment } from '../../lib/payment';
import { logProductAdd, logProductPurchase } from '../../lib/metrika/ecommerce';
import { getPersistConfig, getTransformUIPersistance } from '../helpers/persist';
import { CreateOrderResponse, OrderResponse, UserInfo } from '../../lib/api/types';
import { logOrderInitiated, logOrderCompleted, logOrderError } from '../../lib/metrika/event';
import { getPushTokenForTransaction, YandexPushTokenForTransaction } from '../../lib/js-api/push';
import {
    AuthOptions,
    fetchOrdersHistory,
    createOrder as createOrderAPI,
    saveUserInfo as saveUserInfoAPI,
} from '../../lib/api';
import {
    createCheckoutRequest,
    getCheckoutTotalAmount,
    getCheckoutPaymentOptions,
    getSelectedShippingOption,
    getSelectedShippingAddress,
    isCheckoutRequestAvailable,
} from '../../lib/checkout';
import { authenticate, authOptionsSelector } from './user';
import { AppThunk, RootState } from '..';

export type Order = {
    data: {
        activeOrder?: CreateOrderResponse;
        orders: OrderResponse[];
    };
    ui: {
        isLoading?: boolean;
        isOrderCreationInProgress?: boolean;
        isPaymentInProgress?: boolean;
        isCheckoutInProgress?: boolean;
    };
};

const initialState: Order = {
    data: {
        orders: [],
    },
    ui: {},
};

const order = createSlice({
    name: 'order',
    initialState,
    reducers: {
        fetchStart(state) {
            state.ui.isLoading = true;
        },
        fetchSuccess(state, action: PayloadAction<OrderResponse[]>) {
            state.ui.isLoading = false;
            state.data.orders = action.payload;
        },
        fetchError(state) {
            state.ui.isLoading = false;
        },
        orderCreationStart(state) {
            state.ui.isCheckoutInProgress = true;
            state.ui.isOrderCreationInProgress = true;
        },
        orderCreationSuccess(state, action: PayloadAction<CreateOrderResponse>) {
            state.data.activeOrder = action.payload;
            state.ui.isOrderCreationInProgress = false;
        },
        orderCreationEnd(state) {
            state.ui.isOrderCreationInProgress = false;
        },
        paymentStart(state) {
            state.ui.isPaymentInProgress = true;
        },
        paymentEnd(state) {
            state.ui.isPaymentInProgress = false;
        },
        checkoutEnd(state) {
            state.ui.isCheckoutInProgress = false;
            delete state.data.activeOrder;
        },
    },
    extraReducers: builder => {
        builder.addCase(cleanup, () => initialState);
    },
});

export const {
    fetchStart,
    fetchSuccess,
    fetchError,
    paymentStart,
    paymentEnd,
    checkoutEnd,
    orderCreationStart,
    orderCreationSuccess,
    orderCreationEnd,
} = order.actions;

export const paymentInProgressSelector = (state: RootState) => Boolean(state.order.ui.isPaymentInProgress);
export const checkoutInProgressSelector = (state: RootState) => Boolean(state.order.ui.isCheckoutInProgress);
export const orderCreationInProgressSelector = (state: RootState) => Boolean(state.order.ui.isOrderCreationInProgress);
export const activeOrderSelector = (state: RootState) => state.order.data.activeOrder;
export const ordersSelector = (state: RootState) => state.order.data.orders;

export const orderEventIdsSelector = createSelector(ordersSelector, payments =>
    Array.from(new Set(payments.map(order => order.event.id)))
);

export const ordersLoadingSelector = createSelector(
    orderEventIdsSelector,
    (state: RootState) => state.order.ui,
    (state: RootState) => state.event.ui,
    (orderEventIds, orderUi, eventsUi) => {
        const isEventLoading = orderEventIds.some(event => eventsUi[event]?.isLoading);

        return orderUi.isLoading || isEventLoading;
    }
);

export const fetchOrders = (): AppThunk => async(dispatch, getState) => {
    const authOptions = authOptionsSelector(getState());

    if (!authOptions.jwtToken && !authOptions.oauthToken) {
        return;
    }

    dispatch(fetchStart());

    try {
        const orders = await fetchOrdersHistory(authOptions);
        dispatch(fetchSuccess(orders));
    } catch (err) {
        console.error(err);
        dispatch(fetchError());
    }
};

export const createOrder = (
    event: Event,
    onOrderCreated: () => void = () => {},
    retry: boolean = true
): AppThunk => async(dispatch, getState) => {
    if (isCheckoutRequestAvailable) {
        return dispatch(buyTicketByCheckout(event));
    }

    const authOptions = authOptionsSelector(getState());

    dispatch(orderCreationStart());

    let response: CreateOrderResponse;

    try {
        response = await createOrderAPI(
            {
                eventId: event.id,
                amount: 1,
            },
            authOptions
        );

        await logOrderInitiated(response);

        dispatch(orderCreationSuccess(response));

        onOrderCreated();
    } catch (err) {
        dispatch(orderCreationEnd());

        if (err.status === 401 && retry) {
            return dispatch(authenticate(() => dispatch(createOrder(event, onOrderCreated, false))));
        }
    }
};

export const buyTicket = (event: Event, userInfo: UserInfo): AppThunk => async(
    dispatch,
    getState
) => {
    const state = getState();

    const authOptions = authOptionsSelector(state);
    const activeOrder = activeOrderSelector(state);

    dispatch(paymentStart());

    if (orderCreationInProgressSelector(getState())) {
        throw new Error('Payment is not available. Order creating now');
    }

    // Если нет активного заказа, сначала создаем его
    if (!activeOrder) {
        return dispatch(createOrder(event, () => buyTicket(event, userInfo)));
    }

    logProductAdd(event);

    try {
        await processPayment(activeOrder, userInfo);
        await saveUserInfo(activeOrder, userInfo, authOptions);

        await logOrderCompleted(activeOrder);
        logProductPurchase(event, activeOrder.id);

        dispatch(checkoutEnd());
    } catch (err) {
        const { code } = err;

        logOrderError(activeOrder);

        switch (code) {
            case AppErrorCode.JsApiCancelled:
            case AppErrorCode.JsApiAlreadyShown:
                return;
            default:
                console.error(err);
                alert('Произошла ошибка при покупке билета. Попробуйте ещё раз');
        }
    } finally {
        dispatch(paymentEnd());
        dispatch(fetchOrders());
    }
};

export function buyTicketByCheckout(event: Event): AppThunk {
    return async(dispatch, getState) => {
        const orderId = nanoid();
        const authOptions = authOptionsSelector(getState());

        let response: CreateOrderResponse;

        try {
            const checkoutRequest = createCheckoutRequest(orderId, event);

            checkoutRequest.addEventListener('shippingOptionChange', checkoutEvent => {
                const shippingOption = getSelectedShippingOption(orderId, checkoutEvent.checkoutState);

                if (shippingOption) {
                    const total = getCheckoutTotalAmount(shippingOption.id, event);

                    return checkoutEvent.updateWith({ total });
                }
            });

            checkoutRequest.addEventListener('paymentStart', checkoutEvent => {
                const getCheckoutUpdateDetails = async() => {
                    const shippingOption = getSelectedShippingOption(orderId, checkoutEvent.checkoutState);

                    try {
                        response = await createOrderAPI(
                            {
                                amount: 1,
                                eventId: event.id,
                                deliveryId: shippingOption?.id,
                            },
                            authOptions
                        );

                        await logOrderInitiated(response);

                        return {
                            paymentOptions: getCheckoutPaymentOptions(response.paymentToken),
                        };
                    } catch (err) {
                        console.error(err);

                        return {
                            validationErrors: {
                                error: 'Ошибка оплаты. Не удалось получить токен оплаты. Попробуйте снова',
                            },
                        };
                    }
                };

                checkoutEvent.updateWith(getCheckoutUpdateDetails());
            });

            logProductAdd(event);

            const checkoutState = await checkoutRequest.show();
            const { rawAddress: address = '' } = getSelectedShippingAddress(orderId, checkoutState) ?? {};
            const { name = '', phone = '', email = '' } = checkoutState.payerDetails ?? {};

            response = response!;

            await saveUserInfo(response, { name, phone, email, address }, authOptions);

            await logOrderCompleted(response);
            logProductPurchase(event, response.id);
        } catch (err) {
            const { name } = err;

            if (name === 'AbortError') {
                return;
            }

            console.error(err);
            alert('Произошла ошибка при покупке билета. Попробуйте ещё раз');
        } finally {
            dispatch(fetchOrders());
        }
    };
}

async function processPayment(response: CreateOrderResponse, userInfo: UserInfo) {
    try {
        await processNativePayment(response, userInfo);
    } catch (err) {
        const { code } = err;

        switch (code) {
            case AppErrorCode.JsApiMethodNotAvailable:
                return;
            default:
                throw err;
        }
    }
}

async function fetchPushToken(paymentToken: string) {
    let pushToken: YandexPushTokenForTransaction | null = null;

    try {
        pushToken = await getPushTokenForTransaction(paymentToken);
    } catch (err) {
        console.warn(err);
    }

    return pushToken;
}

async function saveUserInfo(response: CreateOrderResponse, userInfo: UserInfo, authOptions: AuthOptions) {
    const { pushToken } = (await fetchPushToken(response.paymentToken)) ?? {};
    const { id: paymentId } = response;

    try {
        saveUserInfoAPI({ userInfo, paymentId, pushToken }, authOptions);
    } catch (err) {
        console.error(err);
    }
}

const persistConfig = getPersistConfig<Order>('order', {
    transforms: [getTransformUIPersistance<Order['ui']>(initialState.ui)],
});
export default persistReducer(persistConfig, order.reducer);
