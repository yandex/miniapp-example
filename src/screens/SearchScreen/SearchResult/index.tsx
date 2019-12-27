import React from 'react';
import { useSelector } from 'react-redux';

import { RootReducer } from '../../../redux';

import EventsList from '../../../components/EventsList';
import EventCard from '../../../components/EventCard';
import { useThrottleLoading } from '../../../hooks/useThrottleLoading';

import SearchResultSkeleton from './Skeleton';
import styles from './styles.module.css';

type Props = {
    onItemClick: () => void;
};

const SKELETON_THROTTLE_MS = 250;

const SearchResult: React.FC<Props> = ({ onItemClick }) => {
    const { groups } = useSelector((state: RootReducer) => state.search.data.results);
    const { isLoading } = useSelector((state: RootReducer) => state.search.ui.results);

    const isThrottleLoading = useThrottleLoading(isLoading, SKELETON_THROTTLE_MS);

    if (isThrottleLoading) {
        return <SearchResultSkeleton />;
    }

    if (groups.length === 0 && !isLoading && !isThrottleLoading) {
        return <div className={styles.notFound}>Ничего не найдено</div>;
    }

    return (
        <>
            {groups.map(({ code, title, events }) => (
                <section key={code}>
                    <h2 className={styles.title}>{title}</h2>
                    <EventsList items={events} component={EventCard} onItemClick={onItemClick} />
                </section>
            ))}
        </>
    );
};

export default SearchResult;
