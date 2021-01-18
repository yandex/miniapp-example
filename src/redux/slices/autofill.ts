import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { UserInfo } from '../../lib/api/types';
import { AppErrorCode } from '../../lib/error';
import { getProfileData } from '../../lib/autofill';
import { AppThunk, RootState } from '..';

type AutofillState = {
    user?: UserInfo;
};

const initialState: AutofillState = {};

const slice = createSlice({
    name: 'autofill',
    initialState,
    reducers: {
        setAutofilledUser(state, action: PayloadAction<UserInfo>) {
            state.user = action.payload;
        },
    },
});

const { setAutofilledUser } = slice.actions;

export const isAutofilledSelector = (state: RootState) => Boolean(state.autofill.user);
export const autofilledUserSelector = (state: RootState) => state.autofill.user;

export const autofill = (): AppThunk => async dispatch => {
    try {
        const {
            email,
            lastName,
            firstName,
            middleName,
            phoneNumber: phone,
            streetAddress: address,
        } = await getProfileData();

        const name = [lastName, firstName, middleName].filter(Boolean).join(' ');

        dispatch(setAutofilledUser({ name, phone, email, address }));
    } catch (err) {
        const { code } = err;

        if ([AppErrorCode.JsApiDenied, AppErrorCode.JsApiMethodNotAvailable].includes(code)) {
            return console.warn(err);
        }

        console.error(err);
    }
};

export default slice.reducer;
