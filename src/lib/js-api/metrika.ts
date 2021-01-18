import { callJsApi } from './utils';

export async function reportGoalReached(goal: string, params: object): Promise<void> {
    try {
        await callJsApi({
            name: 'window.yandex.app.reportGoalReached',
            args: [goal, params],
            scope: window?.yandex?.app,
            method: 'reportGoalReached',
        });
    } catch (err) {
        console.error(err);
    }
}
