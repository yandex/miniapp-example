import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { AppThunk, RootState } from '../index';
import { cleanup } from '../actions';
import { getPersistConfig, getTransformUIPersistance } from '../helpers/persist';
import { getPushTokenForTransaction, YandexPushTokenForTransaction } from '../../lib/js-api/push';
import { fetchOrdersHistory, createOrder as createOrderAPI, saveUserInfo as saveUserInfoAPI } from '../../lib/api';
import { Event } from '../../lib/api/fragments/event';
import { CreateOrderResponse, OrderResponse, UserInfo } from '../../lib/api/types';
import { MetrikaGoals, MetrikaOrderParams, reachGoal, reportGoalReached } from '../../lib/metrika';
import { logProductAdd, logProductPurchase } from '../../lib/metrika/ecommerce';
import { processNativePayment } from '../../lib/payment';
import { AppErrorCode } from '../../lib/error';
import { authenticate, jwtTokenSelector, oauthTokenSelector } from './user';

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
    const state = getState();

    const jwtToken = jwtTokenSelector(state);
    const oauthToken = oauthTokenSelector(state);

    if (!jwtToken && !oauthToken) {
        return;
    }

    dispatch(fetchStart());

    try {
        const orders = await fetchOrdersHistory({ jwtToken, oauthToken });
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
    const state = getState();

    const jwtToken = jwtTokenSelector(state);
    const oauthToken = oauthTokenSelector(state);

    dispatch(orderCreationStart());

    let response: CreateOrderResponse;

    try {
        response = await createOrderAPI(
            {
                eventId: event.id,
                amount: 1,
            },
            {
                jwtToken,
                oauthToken,
            }
        );

        const metrikaParams = {
            order_id: response.id,
            price: response.cost,
            price_without_discount: response.cost,
        };

        reachGoal(MetrikaGoals.OrderInitiated, metrikaParams);
        reportGoalReached(MetrikaGoals.OrderInitiated, metrikaParams);

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

    const jwtToken = jwtTokenSelector(state);
    const oauthToken = oauthTokenSelector(state);
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

    const metrikaParams: MetrikaOrderParams = {
        order_id: activeOrder.id,
        price: activeOrder.cost,
        price_without_discount: activeOrder.cost,
    };

    try {
        await processNativePayment(activeOrder, userInfo);

        const { pushToken } = (await fetchPushToken(activeOrder.paymentToken)) ?? {};
        saveUserInfoAPI({ userInfo, paymentId: activeOrder.id, pushToken }, { jwtToken, oauthToken })
            .catch((error: Error) => console.error(error));

        reachGoal(MetrikaGoals.OrderCompleted, metrikaParams);
        reportGoalReached(MetrikaGoals.OrderCompleted, metrikaParams);
        logProductPurchase(event, activeOrder.id);

        dispatch(checkoutEnd());
    } catch (err) {
        const { code } = err;

        reachGoal(MetrikaGoals.OrderError, metrikaParams);

        switch (code) {
            case AppErrorCode.JsApiCancelled:
            case AppErrorCode.JsApiAlreadyShown:
                return;
            case AppErrorCode.JsApiMethodNotAvailable:
                console.warn(err);
                return alert('Платежи не поддерживаются в текущей версии браузера');
            default:
                console.error(err);
                alert('Произошла ошибка при покупке билета. Попробуйте ещё раз');
        }
    } finally {
        dispatch(paymentEnd());
        dispatch(fetchOrders());
    }
};

async function fetchPushToken(paymentToken: string) {
    let pushToken: YandexPushTokenForTransaction | null = null;

    try {
        pushToken = await getPushTokenForTransaction(paymentToken);
    } catch (err) {
        console.warn(err);
    }

    return pushToken;
}

const persistConfig = getPersistConfig<Order>('order', {
    transforms: [getTransformUIPersistance<Order['ui']>(initialState.ui)],
});
export default persistReducer(persistConfig, order.reducer);
