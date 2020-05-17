import { PersistConfig, createTransform } from 'redux-persist';
import { StateReconciler } from 'redux-persist/es/types';
import { parse } from 'date-fns';
// @ts-ignore
import createIdbStorage from '@piotr-cz/redux-persist-idb-storage/src';

export type Filter = {
    [key: string]: string | number;
};
export function createPersistKeyByFilter(filter: Filter) {
    return JSON.stringify(filter, Object.keys(filter).sort());
}

export function restoreFilterFromPersistKey<T>(key: keyof T): Filter {
    return JSON.parse(key as string);
}

type State = { [key: string]: Record<string, unknown> };

export function stateReconcilerByDate<T extends State>(inboundState: T): T {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nowTime = today.getTime();

    return Object.keys(inboundState)
        .filter(key => key !== '_persist')
        .reduce<T>((result, key: keyof T) => {
            result[key] = Object.keys(inboundState[key]).reduce((inboundResult, inboundKey: keyof T[keyof T]) => {
                const { date } = restoreFilterFromPersistKey(inboundKey);

                // Если фильтра по дате нет, то данные не зависят от времени
                if (!date) {
                    inboundResult[inboundKey] = inboundState[key][inboundKey];
                    return inboundResult;
                }

                const keyTime = parse(date).getTime();

                // Оставляем только актуальные данные
                if (nowTime <= keyTime) {
                    inboundResult[inboundKey] = inboundState[key][inboundKey];
                }

                return inboundResult;
            }, {} as T[keyof T]);

            return result;
        }, {} as T);
}

type PersistOptions<S> = Omit<PersistConfig<S>, 'key' | 'storage'> & {
    stateReconciler?: StateReconciler<S>;
};
export function getPersistConfig<S>(key: string, options?: PersistOptions<S>): PersistConfig<S> {
    return {
        ...options,
        storage: createIdbStorage({
            name: 'miniapp-example',
            storeName: 'redux-persist',
        }),
        key,
        serialize: false,
        // @ts-ignore
        deserialize: false,
        version: 5,
        migrate: (persistedState, currentVersion) => {
            // Достаем версию сохраненных в кэше данных.
            const persistedVersion = persistedState && persistedState._persist.version;
            // Если версия сохраненных данных совпадает с текущей версией обрабатываемых данных,
            // оставляем данные неизменными, иначе - сбрасываем данные.
            const migratedState = persistedVersion === currentVersion ? persistedState : undefined;

            return Promise.resolve(migratedState);
        },
        timeout: 10000, // 10 секунд может быть полезно для low-end устройств
    };
}

export function getTransformUIPersistance<T>(defaultUIState: T) {
    return createTransform((state: State, key) => {
        if (key === 'ui') {
            return defaultUIState;
        }

        return state;
    });
}
