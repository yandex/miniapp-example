import React from 'react';
import { RouteProps } from 'react-router-dom';

import StackNavigator from './StackNavigator';

export type ScreenParams = {
    [key: string]: string;
};

export type ScreenComponent = React.FC<ScreenParams>;

export type ScreenConfig = RouteProps & {
    component: ScreenComponent;
};

export type Screens = ScreenConfig[];
export type Options = {
    maxDepth?: number;
};

export function createStackNavigator(screens: Screens, options: Options = {}) {
    return () => <StackNavigator screens={screens} maxDepth={options.maxDepth} />;
}
