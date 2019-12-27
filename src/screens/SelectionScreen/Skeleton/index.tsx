import React from 'react';

import { Text } from '../../../components/Skeletons';
import DateFilterSkeleton from '../../../components/DateFilter/Skeleton';
import EventsListSkeleton from '../../../components/EventsList/Skeleton';
import EventCardSkeleton from '../../../components/EventCard/Skeleton';

import styles from './styles.module.css';

const SelectionScreenSkeleton: React.FC = () => (
    <div>
        <DateFilterSkeleton />
        <div className={styles.content}>
            <Text className={styles.title} />
            <EventsListSkeleton count={10} card={EventCardSkeleton} />
        </div>
    </div>
);

export default SelectionScreenSkeleton;
