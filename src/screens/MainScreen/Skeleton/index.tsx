import React from 'react';

import { Text } from '../../../components/Skeletons';
import DateFilterSkeleton from '../../../components/DateFilter/Skeleton';
import EventsListSkeleton from '../../../components/EventsList/Skeleton';
import EventCardMainSkeleton from '../../../components/EventCardMain/Skeleton';
import SelectionListSkeleton from '../../../components/SelectionList/Skeleton';

import styles from './styles.module.css';

const MainScreenSkeleton: React.FC = () => (
    <div>
        <DateFilterSkeleton />
        <div className={styles.content}>
            <Text className={styles.title} />
            <EventsListSkeleton itemsGap={8} count={5} card={EventCardMainSkeleton} />
            <Text className={styles.title} />
            <SelectionListSkeleton />
        </div>
    </div>
);

export default MainScreenSkeleton;
