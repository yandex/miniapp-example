import React from 'react';

import { Rect, Text } from '../../../../components/Skeletons';

import styles from './styles.module.css';

const OrderSkeleton: React.FC = () => {
    return (
        <div className={styles.card}>
            <Rect className={styles.image} />
            <div className={styles.content}>
                <Text size={20} className={styles.text} />
                <Text size={16} className={styles.short} />
                <Text size={16} className={styles.short} />
            </div>
            <div className={styles.right}>
                <Text size={20} className={styles.short} />
                <Text size={16} className={styles.text} />
            </div>
        </div>
    );
};

export default OrderSkeleton;
