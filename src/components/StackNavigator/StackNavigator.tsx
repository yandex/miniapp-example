import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, matchPath, useHistory } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { isIOS } from '../../lib/is-ios';
import Screen, { ScreenType } from './Screen';
import styles from './Screen/styles.module.css';
import { Screens, Params, ScreenConfig } from './index';

const classNames = {
    enter: styles.screenEnter,
    enterActive: styles.screenEnterActive,
    exit: styles.screenExit,
    exitActive: styles.screenExitActive,
};
const transitionCallbacks = {
    onEnter: (node: HTMLElement) => {
        if (node.previousElementSibling) {
            node.previousElementSibling.classList.add(styles.offset);
        }
    },

    onExit: (node: HTMLElement) => {
        if (node.previousElementSibling) {
            node.previousElementSibling.classList.remove(styles.offset);
        }
    },
};
const transitionTimeouts = {
    enter: 600, // Сама анимация 300ms + поправка на медленные девайсы
    exit: 500, // Сама анимация 250ms + поправка на медленные девайсы
};

type ScreenStack = Array<ScreenType>;

type Props = {
    screens: Screens;
    maxDepth?: number;
    transitions?: boolean;
};

export type BackwardProps = { fallback?: string };

const StackNavigator: React.FC<Props> = ({ screens, maxDepth = 10, transitions = false }) => {
    const [stack, setStack] = useState<ScreenStack>([]);
    const location = useLocation();
    const history = useHistory();
    const iOS = isIOS();

    useLocationChange(() => {
        if (iOS) {
            window.scrollTo(0, 0);
        }

        const isBackward = history.action === 'POP';
        const isReplace = history.action === 'REPLACE';

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
            params: match.params as Params,
            location: { ...location },
        };

        // Если навигация «назад», то просто заменяем единственный экран в стеке
        if (isBackward && stack.length === 1) {
            setStack([newStackItem]);
            return;
        }

        // Если делается замена текущего урла, то просто перерисовываем текущий экран
        if (isReplace) {
            if (screen.component === stack[stack.length - 1].component) {
                const newStack = [...stack];

                newStack[stack.length - 1] = {
                    ...newStack[stack.length - 1],
                    params: newStackItem.params,
                    location: newStackItem.location,
                };

                setStack(newStack);
            } else {
                setStack([...stack.slice(0, -1), newStackItem]);
            }
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

    const onBackward = useCallback(
        ({ fallback }: BackwardProps = {}) => {
            if (iOS) {
                window.scrollTo(0, 0);
            }

            if (history.length > 1) {
                history.goBack();
            } else if (fallback) {
                history.replace(fallback);
            }
        },
        [history, iOS]
    );

    if (transitions && !iOS) {
        return (
            <TransitionGroup component={null}>
                {stack.map((screen, index) => {
                    return (
                        <CSSTransition
                            key={screen.id}
                            timeout={transitionTimeouts}
                            classNames={classNames}
                            enter={stack.length !== 1}
                            exit={stack.length !== 1}
                            onEnter={transitionCallbacks.onEnter}
                            onExit={transitionCallbacks.onExit}
                        >
                            <Screen
                                key={screen.id}
                                isVisible={index === stack.length - 1}
                                transitions
                                onBackward={onBackward}
                                screen={screen}
                            />
                        </CSSTransition>
                    );
                })}
            </TransitionGroup>
        );
    }

    if (iOS) {
        const screen = stack[stack.length - 1];

        return screen ? <Screen isVisible onBackward={onBackward} screen={screen} /> : null;
    }

    return (
        <>
            {stack.map((screen, index) => {
                return (
                    <Screen
                        key={screen.id}
                        isVisible={index === stack.length - 1}
                        onBackward={onBackward}
                        screen={screen}
                    />
                );
            })}
        </>
    );
};

// Хак с useEffect, который вызывается только при изменении Location
// Позволяет обойти линтинг зависимостией в хуке useEffect
function useLocationChange(callback: () => void) {
    const location = useLocation();

    useEffect(callback, [location]);
}

export default StackNavigator;
