import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { dateToString } from '../../lib/date';

export type DateFilter = {
    date: string;
    period: number;
};

const initialState: DateFilter = {
    date: dateToString(new Date()).toString(),
    period: 1,
};

const dateFilter = createSlice({
    name: 'date-filter',
    initialState,
    reducers: {
        setDate(state, action: PayloadAction<{ date: string; period?: number }>) {
            state.date = action.payload.date;
            state.period = action.payload.period || 1;
        },
    },
});

export const { setDate } = dateFilter.actions;

export default dateFilter.reducer;
