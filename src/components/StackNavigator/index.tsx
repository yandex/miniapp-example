import React from 'react';
import { RouteProps, useLocation } from 'react-router-dom';

import { isIOS } from '../../lib/is-ios';
import StackNavigator from './StackNavigator';

export { useBackward, useScreenRef, useScreenVisible } from './hooks';

export type Params = Record<string, string>;
export type Location = ReturnType<typeof useLocation>;

export type ScreenProps = {
    params: Params;
    location: Location;
};

export type ScreenComponent = React.FC<ScreenProps>;

export type ScreenConfig = RouteProps & {
    component: ScreenComponent;
};

export type Screens = ScreenConfig[];
export type Options = {
    maxDepth?: number;
    transitions?: boolean;
};

export function createStackNavigator(screens: Screens, options: Options = {}) {
    if (isIOS() && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
    }

    return () => <StackNavigator screens={screens} maxDepth={options.maxDepth} transitions={options.transitions} />;
}
