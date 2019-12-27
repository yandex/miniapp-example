import React from 'react';

import { Rect, Text } from '../../Skeletons';

import styles from './styles.module.css';

const EventCardSkeleton: React.FC = () => {
    return (
        <div className={styles.card}>
            <Rect className={styles.image} />
            <div className={styles.right}>
                <Text className={styles.title} />
                <Text className={styles.description} />
            </div>
        </div>
    );
};

export default EventCardSkeleton;
