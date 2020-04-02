import { useContext, useMemo } from 'react';

import { StackNavigatorContext } from './context';
import { BackwardProps } from './StackNavigator';

export function useBackward(params?: BackwardProps) {
    const onBackward = useContext(StackNavigatorContext).onBackward;

    return useMemo(() => onBackward.bind(null, params), [onBackward, params]);
}

export function useScreenVisible() {
    return useContext(StackNavigatorContext).isVisible;
}

export function useScreenRef() {
    return useContext(StackNavigatorContext).ref;
}
