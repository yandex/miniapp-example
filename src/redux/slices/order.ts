import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { AppThunk, RootState } from '../index';
import { cleanup } from '../actions';
import { getPersistConfig, getTransformUIPersistance } from '../helpers/persist';
import { getCurrentUserId } from '../../lib/account-manager';
import { createOrder, fetchOrdersHistory, OrderData } from '../../lib/api';
import { Event } from '../../lib/api/fragments/event';
import { CreateOrderResponse, OrderResponse } from '../../lib/api/types';
import { MetrikaGoals, MetrikaOrderParams, reachGoal } from '../../lib/metrika';
import { logProductAdd, logProductPurchase } from '../../lib/metrika/ecommerce';
import { reportGoalReached } from '../../lib/metrika/js-api';
import { PaymentError, processNativePayment } from '../../lib/payment';
import { authenticate } from './user';

export type Order = {
    data: {
        orders: OrderResponse[];
    };
    ui: {
        isLoading?: boolean;
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
        paymentStart(state) {
            state.ui.isPaymentInProgress = true;
        },
        paymentEnd(state) {
            state.ui.isPaymentInProgress = false;
        },
        checkoutStart(state) {
            state.ui.isCheckoutInProgress = true;
        },
        checkoutEnd(state) {
            state.ui.isCheckoutInProgress = false;
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
    checkoutStart,
    checkoutEnd,
} = order.actions;

export const paymentInProgressSelector = (state: RootState) => Boolean(state.order.ui.isPaymentInProgress);
export const checkoutInProgressSelector = (state: RootState) => Boolean(state.order.ui.isCheckoutInProgress);
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

export const buyTicket = (event: Event, userInfo: OrderData['userInfo'], retry: boolean = true): AppThunk => async(
    dispatch,
    getState
) => {
    const { jwtToken, psuid, currentUser } = getState().user;

    dispatch(paymentStart());
    logProductAdd(event);

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

    let response: CreateOrderResponse;
    let metrikaParams: MetrikaOrderParams;

    try {
        response = await createOrder(
            {
                eventId: event.id,
                amount: 1,
                userInfo,
            },
            jwtToken
        );

        metrikaParams = {
            order_id: response.id,
            price: response.cost,
            price_without_discount: response.cost,
        };

        reachGoal(MetrikaGoals.OrderInitiated, metrikaParams);
        await reportGoalReached(MetrikaGoals.OrderInitiated, metrikaParams);
    } catch (err) {
        dispatch(paymentEnd());

        if (err.status === 401 && retry) {
            return dispatch(authenticate(() => dispatch(buyTicket(event, userInfo, false))));
        }

        return alert('Произошла ошибка при покупке билета. Попробуйте ещё раз');
    }

    try {
        await processNativePayment(response, currentUser);

        reachGoal(MetrikaGoals.OrderCompleted, metrikaParams);
        logProductPurchase(event, response.id);
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

const persistConfig = getPersistConfig<Order>('order', {
    transforms: [getTransformUIPersistance<Order['ui']>(initialState.ui)],
});
export default persistReducer(persistConfig, order.reducer);
