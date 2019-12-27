import React, { ComponentType } from 'react';

import { DEFAULT_ITEMS_GAP } from '../constants';

import styles from './styles.module.css';

type Props = {
    count: number;
    card: ComponentType;
    itemsGap?: number;
};

const EventsListSkeleton: React.FC<Props> = ({ itemsGap = DEFAULT_ITEMS_GAP, count, card: Card }) => (
    <div className={styles.events} style={{ gridGap: `${itemsGap}px` }}>
        {Array(count)
            .fill(0)
            .map((_, index) => (
                <Card key={index} />
            ))}
    </div>
);

export default EventsListSkeleton;
