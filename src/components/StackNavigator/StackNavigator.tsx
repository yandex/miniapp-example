import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, matchPath, useHistory } from 'react-router-dom';

import Screen from './Screen';
import { StackNavigatorContext } from './context';
import { Screens, ScreenParams, ScreenComponent, ScreenConfig } from './index';

type ScreenStack = Array<{
    id: string;
    params: ScreenParams;
    component: ScreenComponent;
}>;

type Props = {
    screens: Screens;
    maxDepth?: number;
};

const StackNavigator: React.FC<Props> = ({ screens, maxDepth = 10 }) => {
    const [stack, setStack] = useState<ScreenStack>([]);
    const location = useLocation();
    const history = useHistory();

    useLocationChange(() => {
        const isBackward = history.action === 'POP';

        // Если навигация «назад» и в стеке есть отрисованный предыдущий экран, то просто удаляем последний экран
        if (isBackward && stack.length > 1) {
            setStack(stack.slice(0, -1));
            return;
        }

        let screen: ScreenConfig | null = null;
        let match: ReturnType<typeof matchPath> = null;

        for (const item of screens) {
            match = matchPath(location.pathname, item);

            if (match) {
                screen = item;
                break;
            }
        }

        if (!screen || !match) {
            console.warn('No screen matched for route', location.pathname);
            return;
        }

        const newStackItem: ScreenStack[0] = {
            id: location.key || Date.now().toString(),
            component: screen.component,
            params: match.params as ScreenParams,
        };

        // Если навигация «назад», то просто заменяем единственный экран в стеке
        if (isBackward && stack.length === 1) {
            setStack([newStackItem]);
            return;
        }

        // Навигация «вперед», добавляем новый экран в стек
        const newStack = [...stack, newStackItem];

        // При достижении лимита количенства одновременно отрисованных экранов начинаем удалять старые экраны
        if (newStack.length > maxDepth) {
            newStack.splice(0, stack.length - maxDepth + 1);
        }

        setStack(newStack);
    });

    const onBackward = useCallback(() => {
        if (history.length > 1) {
            history.goBack();
        }
    }, [history]);

    const context = useMemo(() => {
        return {
            onBackward,
        };
    }, [onBackward]);

    return (
        <StackNavigatorContext.Provider value={context}>
            {stack.map((screen, index) => {
                return (
                    <Screen key={screen.id} isVisible={index === stack.length - 1}>
                        <screen.component {...screen.params} />
                    </Screen>
                );
            })}
        </StackNavigatorContext.Provider>
    );
};

// Хак с useEffect, который вызывается только при изменении Location
// Позволяет обойти линтинг зависимостией в хуке useEffect
function useLocationChange(callback: () => void) {
    const location = useLocation();

    useEffect(callback, [location]);
}

export default StackNavigator;
