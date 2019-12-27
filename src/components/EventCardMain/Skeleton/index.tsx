import React from 'react';

import { Rect } from '../../Skeletons';

import styles from './styles.module.css';

const EventCardMainSkeleton: React.FC = () => {
    return <Rect className={styles.card} />;
};

export default EventCardMainSkeleton;
