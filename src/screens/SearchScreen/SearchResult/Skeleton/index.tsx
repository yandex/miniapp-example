import React from 'react';

import { Text } from '../../../../components/Skeletons';
import EventsListSkeleton from '../../../../components/EventsList/Skeleton';
import EventCardSkeleton from '../../../../components/EventCard/Skeleton';

import styles from './styles.module.css';

const SearchResultSkeleton: React.FC = () => (
    <>
        {Array(3)
            .fill(0)
            .map((_, index) => (
                <div key={index}>
                    <Text className={styles.title} />

                    <EventsListSkeleton count={3} card={EventCardSkeleton} />
                </div>
            ))}
    </>
);

export default SearchResultSkeleton;
