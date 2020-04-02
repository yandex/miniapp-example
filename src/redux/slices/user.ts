import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getCurrentUserInfo } from '../../lib/account-manager';

import { AppThunk } from '../index';
import { MediaImageSize } from '../../lib/api/fragments/image-size';

export type User = {
    currentUser: {
        uid?: string;
        name?: string;
        img?: {
            src?: MediaImageSize;
            src2x?: MediaImageSize;
        };
    };
};

const initialState: User = {
    currentUser: {},
};

const user = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User['currentUser']>) {
            state.currentUser = action.payload;
        },
    },
});

export const { setUser } = user.actions;

export const loadUserInfo = (): AppThunk => async dispatch => {
    try {
        const userInfo = await getCurrentUserInfo();
        dispatch(setUser(userInfo));
    } catch (err) {
        console.error(err);
    }
};

export default user.reducer;
