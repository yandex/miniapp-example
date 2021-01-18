import { AppError, AppErrorCode } from '../error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type YandexJsApiObject = Record<string, any> | undefined;

export function callJsApi<T extends YandexJsApiObject, K extends keyof NonNullable<T>>({
    name,
    args,
    scope,
    method,
}: {
    name: string;
    args: Parameters<NonNullable<NonNullable<T>[K]>>;
    scope: T;
    method: K,
}): ReturnType<NonNullable<NonNullable<T>[K]>> {
    const func = scope ? scope![method] : null;

    if (!func) {
        throw new AppError(AppErrorCode.JsApiMethodNotAvailable, `${name} is not available in this browser version.`);
    }

    return func.apply(scope, args);
}
