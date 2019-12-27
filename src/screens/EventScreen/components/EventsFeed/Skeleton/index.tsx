import React from 'react';

import { Text } from '../../../../../components/Skeletons';
import { EventCardVerticalSkeleton } from '../../../../../components/EventCardVertical/Skeleton';

import styles from './styles.module.css';

export const EventsFeedSkeleton: React.FC = () => (
    <div className={styles.feed}>
        <Text className={styles.title} />
        <div className={styles.events}>
            <div className={styles.item}>
                <EventCardVerticalSkeleton />
            </div>
            <div className={styles.item}>
                <EventCardVerticalSkeleton />
            </div>
            <div className={styles.item}>
                <EventCardVerticalSkeleton />
            </div>
        </div>
    </div>
);
