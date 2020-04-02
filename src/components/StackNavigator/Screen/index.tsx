import React, { createRef, useMemo } from 'react';

import { StackNavigatorContext } from '../context';
import { Location, Params, ScreenComponent } from '../index';

import { isIOS } from '../../../lib/is-ios';
import styles from './styles.module.css';

export type ScreenType = {
    id: string;
    params: Params;
    component: ScreenComponent;
    location: Location;
};

type Props = {
    isVisible: boolean;
    onBackward: () => void;
    screen: ScreenType;
    transitions?: boolean;
};

const Screen: React.FC<Props> = ({ isVisible, transitions, screen, onBackward }) => {
    const className = isIOS() ? '' : [styles.screen, !isVisible && !transitions && styles.hidden].filter(Boolean).join(' ');
    const ref = createRef<HTMLDivElement>();

    const context = useMemo(() => {
        return {
            onBackward,
            isVisible,
            ref,
        };
    }, [onBackward, isVisible, ref]);

    return (
        <StackNavigatorContext.Provider value={context}>
            <div className={className} ref={ref}>
                <screen.component params={screen.params} location={screen.location} />
            </div>
        </StackNavigatorContext.Provider>
    );
};

export default Screen;
