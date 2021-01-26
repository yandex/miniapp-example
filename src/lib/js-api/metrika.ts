import { AppErrorCode } from '../error';
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
        const { code } = err;

        if (code === AppErrorCode.JsApiMethodNotAvailable) {
            return;
        }

        console.error(err);
    }
}
