import { reportGoalReached } from '../js-api/metrika';
import { CreateOrderResponse } from '../api/types';
import { reachGoal, MetrikaGoals, MetrikaOrderParams } from '.';

function buildMetrikaOrderParams(response: CreateOrderResponse): MetrikaOrderParams {
    return {
        order_id: response.id,
        price: response.cost,
        price_without_discount: response.cost,
    };
}

export async function logOrderInitiated(response: CreateOrderResponse): Promise<void> {
    const metrikaParams = buildMetrikaOrderParams(response);

    reachGoal(MetrikaGoals.OrderInitiated, metrikaParams);
    await reportGoalReached(MetrikaGoals.OrderInitiated, metrikaParams);
}

export async function logOrderCompleted(response: CreateOrderResponse): Promise<void> {
    const metrikaParams = buildMetrikaOrderParams(response);

    reachGoal(MetrikaGoals.OrderCompleted, metrikaParams);
    await reportGoalReached(MetrikaGoals.OrderCompleted, metrikaParams);
}

export function logOrderError(response: CreateOrderResponse): void {
    const metrikaParams = buildMetrikaOrderParams(response);

    reachGoal(MetrikaGoals.OrderError, metrikaParams);
}
