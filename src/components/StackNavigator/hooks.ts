import { useContext } from 'react';

import { StackNavigatorContext } from './context';

export function useBackward() {
    return useContext(StackNavigatorContext).onBackward;
}
