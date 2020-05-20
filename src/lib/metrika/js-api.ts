import { MetrikaGoals, MetrikaOrderParams } from './index';

export async function reportGoalReached(goal: MetrikaGoals, params: MetrikaOrderParams) {
    try {
        await window.yandex.app.reportGoalReached(goal, params);
    } catch (err) {
        console.error(err);
    }
}
