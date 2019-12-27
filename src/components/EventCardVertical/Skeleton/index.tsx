import React from 'react';

import { Rect, Text } from '../../Skeletons';

import styles from './styles.module.css';

export const EventCardVerticalSkeleton: React.FC = () => (
    <div className={styles.card}>
        <Rect className={styles.image} />
        <Text className={styles.title} />
        <Text className={styles.description} />
    </div>
);
