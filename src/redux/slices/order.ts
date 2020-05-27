import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { AppThunk, RootReducer } from '../index';
import { cleanup } from '../actions';
import { getPersistConfig, getTransformUIPersistance } from '../helpers/persist';
import { getCurrentUserId } from '../../lib/account-manager';
import { createOrder, fetchOrdersHistory } from '../../lib/api';
import { Event } from '../../lib/api/fragments/event';
import { CreateOrderResponse, OrderResponse } from '../../lib/api/types';
import { MetrikaGoals, MetrikaOrderParams, reachGoal } from '../../lib/metrika';
import { logProductAdd, logProductPurchase } from '../../lib/metrika/ecommerce';
import { reportGoalReached } from '../../lib/metrika/js-api';
import { PaymentError, processNativePayment } from '../../lib/payment';
import { identifyUser } from './user';

export type Order = {
    data: {
        orders: OrderResponse[];
    },
    ui: {
        isLoading?: boolean;
        isCreating?: boolean;
    }
}

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
            state.ui.isCreating = true;
        },
        paymentEnd(state) {
            state.ui.isCreating = false;
        }
    },
    extraReducers: builder => {
        builder.addCase(cleanup, () => initialState);
    }
});

const { fetchStart, fetchSuccess, fetchError, paymentStart, paymentEnd } = order.actions;

export const ordersSelector = (state: RootReducer) => state.order.data.orders;

export const orderEventIdsSelector = createSelector(
    ordersSelector,
    payments => Array.from(new Set(payments.map(order => order.event.id)))
);

export const ordersLoadingSelector = createSelector(
    orderEventIdsSelector,
    (state: RootReducer) => state.order.ui,
    (state: RootReducer) => state.event.ui,
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

export const buyTicket = (
    event: Event,
    retry: boolean = true
): AppThunk => async(dispatch, getState) => {
    const { jwtToken, psuid, currentUser } = getState().user;

    dispatch(paymentStart());
    logProductAdd(event);

    try {
        const currentUserId = await getCurrentUserId();

        if (!jwtToken || !psuid || !currentUserId) {
            await dispatch(identifyUser(() => dispatch(buyTicket(event))));

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
        response = await createOrder(event.id, jwtToken);
        metrikaParams = {
            order_id: response.id,
            price: response.cost,
            price_without_discount: response.cost
        };

        reachGoal(MetrikaGoals.OrderInitiated, metrikaParams);
        await reportGoalReached(MetrikaGoals.OrderInitiated, metrikaParams);
    } catch (err) {
        dispatch(paymentEnd());

        if (err.status === 401 && retry) {
            return dispatch(identifyUser(() => dispatch(buyTicket(event, false))));
        }

        return alert('Произошла ошибка при покупке билета. Попробуйте ещё раз');
    }

    try {
        await processNativePayment(response, currentUser);

        reachGoal(MetrikaGoals.OrderCompleted, metrikaParams);
        logProductPurchase(event, response.id);
        await reportGoalReached(MetrikaGoals.OrderCompleted, metrikaParams);
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
