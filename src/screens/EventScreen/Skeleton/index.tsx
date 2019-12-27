import React from 'react';

import { Rect, Text } from '../../../components/Skeletons';
import RecommendedEventsSkeleton from '../components/RecommendedEvents/Skeleton';

import styles from './styles.module.css';

const EventSkeleton: React.FC = () => (
    <div className={styles.container}>
        <div className={styles.image} />

        <div className={styles['button-wrapper']}>
            <Rect className={styles.button} />
        </div>

        <Text className={styles['date-1']} />
        <Text className={styles['date-2']} />

        <Rect className={styles.map} />

        <Text className={styles['place-1']} />
        <Text className={styles['place-2']} />

        <div className={styles.gallery}>
            <Text className={styles['gallery-header']} />
            <div className={styles['gallery-content']}>
                <Rect className={styles['gallery-card']} />
                <Rect className={styles['gallery-card']} />
                <Rect className={styles['gallery-card']} />
            </div>
        </div>

        <div className={styles.description}>
            {Array(5)
                .fill(0)
                .map((_, index) => (
                    <Text key={index} className={styles[`description-line-${index + 1}`]} />
                ))}
        </div>

        <div className={styles.recommended}>
            <RecommendedEventsSkeleton />
        </div>
    </div>
);
export default EventSkeleton;
