import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { getPersistConfig } from '../helpers/persist';

import { MenuTag } from '../../lib/api/fragments/city';

export type Menu = {
    visible: boolean;
    items: Array<MenuTag>;
    activeItem: MenuTag['code'];
};

const initialState: Menu = {
    visible: false,
    items: [],
    activeItem: '',
};

const menu = createSlice({
    name: 'menu',
    initialState,
    reducers: {
        setItems(state, action: PayloadAction<MenuTag[]>) {
            state.items = action.payload;
        },
        setVisible(state, action: PayloadAction<boolean>) {
            state.visible = action.payload;
        },
    },
});

export const { setItems, setVisible } = menu.actions;

const persistConfig = getPersistConfig<Menu>('menu');
export default persistReducer(persistConfig, menu.reducer);
