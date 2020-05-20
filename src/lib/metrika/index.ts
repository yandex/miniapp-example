/* eslint-disable camelcase */
import { YMetrikaInitParams, YMetrikaVisitParams } from './types';

const METRIKA_COUNTER_ID = 62405404;

export const initialOptions: YMetrikaInitParams = {
    defer: true,
    clickmap: true,
    trackLinks: true,
    trackHash: true,
    accurateTrackBounce: true,
};

export enum MetrikaGoals {
    OrderInitiated = 'order_initiated',
    OrderCompleted = 'order_completed',
    OrderError = 'order_error',
}

export type MetrikaOrderParams = {
    order_id: number;
    price: number;
    price_without_discount: number;
}

export function initMetrika() {
    window.ym?.(METRIKA_COUNTER_ID, 'init', initialOptions);
}

export function hit(url: string, options?: { params?: YMetrikaVisitParams }) {
    window.ym?.(METRIKA_COUNTER_ID, 'hit', url, options);
}

export function reachGoal(name: MetrikaGoals, params: MetrikaOrderParams) {
    window.ym?.(METRIKA_COUNTER_ID, 'reachGoal', name, params);
}
