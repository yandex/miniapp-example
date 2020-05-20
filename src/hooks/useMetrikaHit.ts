import { useEffect } from 'react';

import { useScreenVisible } from '../components/StackNavigator';
import { hit } from '../lib/metrika';
import { YMetrikaVisitParams } from '../lib/metrika/types';

export function useMetrikaHit(params?: YMetrikaVisitParams) {
    const isVisible = useScreenVisible();

    useEffect(() => {
        if (isVisible) {
            hit(window.location.href, { params });
        }
    }, [isVisible, params]);
}
