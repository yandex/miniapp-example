import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { AppThunk, RootState } from '../index';
import { cleanup } from '../actions';
import { getPersistConfig, getTransformUIPersistance } from '../helpers/persist';
import { getCurrentUserId } from '../../lib/account-manager';
import { getTransactionPushToken, YandexTransactionPushToken } from '../../lib/push-notification';
import { createOrder as createOrderAPI, saveUserInfo as saveUserInfoAPI, fetchOrdersHistory } from '../../lib/api';
import { Event } from '../../lib/api/fragments/event';
import { CreateOrderResponse, OrderResponse, UserInfo } from '../../lib/api/types';
import { MetrikaGoals, MetrikaOrderParams, reachGoal } from '../../lib/metrika';
import { logProductAdd, logProductPurchase } from '../../lib/metrika/ecommerce';
import { reportGoalReached } from '../../lib/metrika/js-api';
import { PaymentError, processNativePayment } from '../../lib/payment';
import { authenticate } from './user';

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
    const { jwtToken } = getState().user;

    if (!jwtToken) {
        return;
    }

    dispatch(fetchStart());

    try {
        const orders = await fetchOrdersHistory(jwtToken);
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
    const { jwtToken, psuid } = getState().user;

    dispatch(orderCreationStart());

    try {
        const currentUserId = await getCurrentUserId();

        if (!jwtToken || !psuid || !currentUserId) {
            await dispatch(authenticate(() => dispatch(createOrder(event, onOrderCreated))));

            return dispatch(orderCreationEnd());
        }
    } catch (err) {
        console.error(err);

        alert('Не удалось получить информацию о текущем пользователе');

        return dispatch(orderCreationEnd());
    }

    let response: CreateOrderResponse;

    try {
        response = await createOrderAPI(
            {
                eventId: event.id,
                amount: 1,
            },
            jwtToken
        );

        const metrikaParams = {
            order_id: response.id,
            price: response.cost,
            price_without_discount: response.cost,
        };

        reachGoal(MetrikaGoals.OrderInitiated, metrikaParams);
        await reportGoalReached(MetrikaGoals.OrderInitiated, metrikaParams);

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
    const { currentUser, jwtToken, psuid } = getState().user;
    const { activeOrder } = getState().order.data;

    dispatch(paymentStart());

    try {
        const currentUserId = await getCurrentUserId();

        if (!jwtToken || !psuid || !currentUserId) {
            await dispatch(authenticate(() => dispatch(buyTicket(event, userInfo))));

            return dispatch(paymentEnd());
        }
    } catch (err) {
        console.error(err);

        alert('Не удалось получить информацию о текущем пользователе');

        return dispatch(paymentEnd());
    }

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
        await processNativePayment(activeOrder, currentUser);

        const { pushToken } = (await fetchPushToken(activeOrder.paymentToken)) ?? {};
        saveUserInfoAPI({ userInfo, paymentId: activeOrder.id, pushToken }, jwtToken)
            .catch((error: Error) => console.error(error));

        reachGoal(MetrikaGoals.OrderCompleted, metrikaParams);
        logProductPurchase(event, activeOrder.id);
        await reportGoalReached(MetrikaGoals.OrderCompleted, metrikaParams);

        dispatch(checkoutEnd());
    } catch (err) {
        console.error(err);

        reachGoal(MetrikaGoals.OrderError, metrikaParams);

        switch (err.message) {
            case PaymentError.Shown:
            case PaymentError.Cancelled:
                return;
            case PaymentError.NotSupported:
                return alert('Платежи не поддерживаются в текущей версии браузера');
            default:
                alert('Произошла ошибка при покупке билета. Попробуйте ещё раз');
        }
    } finally {
        dispatch(paymentEnd());
        dispatch(fetchOrders());
    }
};

async function fetchPushToken(paymentToken: string) {
    let pushToken: YandexTransactionPushToken | null = null;

    try {
        pushToken = await getTransactionPushToken(paymentToken);
    } catch (error) {
        console.error(error);
    }

    return pushToken;
}

const persistConfig = getPersistConfig<Order>('order', {
    transforms: [getTransformUIPersistance<Order['ui']>(initialState.ui)],
});
export default persistReducer(persistConfig, order.reducer);
