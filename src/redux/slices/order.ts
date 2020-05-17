import { createSlice } from '@reduxjs/toolkit';
import { Event } from '../../lib/api/fragments/event';
import { AppThunk } from '../index';
import { processNativePayment, PaymentError } from '../../lib/payment';
import { getCurrentUserId } from '../../lib/account-manager';
import { createOrder } from '../../lib/api';
import { login } from './user';

export type Order = {
    ui: {
        isLoading?: boolean;
    }
}

const initialState: Order = {
    ui: {},
};

const order = createSlice({
    name: 'order',
    initialState,
    reducers: {
        paymentStart(state) {
            state.ui.isLoading = true;
        },
        paymentEnd(state) {
            state.ui.isLoading = false;
        }
    }
});

const { paymentStart, paymentEnd } = order.actions;

export const buyTicket = (
    event: Event,
    retry: boolean = true
): AppThunk => async(dispatch, getState) => {
    const { jwtToken, psuid, currentUser } = getState().user;

    dispatch(paymentStart());

    try {
        const currentUserId = await getCurrentUserId();

        if (!jwtToken || !psuid || !currentUserId) {
            dispatch(login(() => dispatch(buyTicket(event))));
            return dispatch(paymentEnd());
        }
    } catch (err) {
        console.error(err);

        alert('Не удалось получить информацию о текущем пользователе');

        return dispatch(paymentEnd());
    }

    try {
        const response = await createOrder(event.id, jwtToken);

        await processNativePayment(response, currentUser);
    } catch (err) {
        if (err.status === 401 && retry) {
            dispatch(login(() => dispatch(buyTicket(event, false))));
            return dispatch(paymentEnd());
        }

        console.error(err);

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
    }
};

export default order.reducer;
