import { lazy } from 'react';

type LazyDeferred = typeof lazy;

// Минимальное время перед импортом, чтобы дать отрисоваться скелетону
const LAZY_DEFFERED_SLEEP = 50;
// Минимальное время импорта компонента
const LAZY_DEFFERED_DELAY = 500;

export const lazyDeferred: LazyDeferred = importCallback => {
    type LazyImportType = ReturnType<typeof importCallback>;

    return lazy(() =>
        Promise.all<LazyImportType, void>([
            new Promise<LazyImportType>(resolve => setTimeout(() => resolve(importCallback()), LAZY_DEFFERED_SLEEP)),
            new Promise<void>(resolve => setTimeout(resolve, LAZY_DEFFERED_DELAY)),
        ]).then(([module]) => module)
    );
};
