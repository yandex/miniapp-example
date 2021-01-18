import { reportGoalReached as jsApiReportGoalReached } from '../js-api/metrika';
import { YMetrikaInitParams, YMetrikaVisitParams } from './types';

const METRIKA_COUNTER_ID = 62405404;

export const initialOptions: YMetrikaInitParams = {
    defer: true,
    clickmap: true,
    trackLinks: true,
    trackHash: true,
    accurateTrackBounce: true,
    ecommerce: 'dataLayer'
};

export enum MetrikaGoals {
    OrderInitiated = 'order_initiated',
    OrderCompleted = 'order_completed',
    OrderError = 'order_error',
}

export type MetrikaOrderParams = {
    price: number;
    order_id: number;
    price_without_discount: number;
}

export function initMetrika() {
    window.dataLayer = window.dataLayer ?? [];
    window.ym?.(METRIKA_COUNTER_ID, 'init', initialOptions);
}

export function hit(url: string, options?: { params?: YMetrikaVisitParams }) {
    window.ym?.(METRIKA_COUNTER_ID, 'hit', url, options);
}

export function reachGoal(name: MetrikaGoals, params: MetrikaOrderParams) {
    window.ym?.(METRIKA_COUNTER_ID, 'reachGoal', name, params);
}

export function reportGoalReached(goal: MetrikaGoals, params: MetrikaOrderParams) {
    jsApiReportGoalReached(goal, params);
}
