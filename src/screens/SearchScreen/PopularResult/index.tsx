import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { getEventUrl } from '../../../lib/url-builder';
import { RootReducer } from '../../../redux';

import PopularResultSkeleton from './Skeleton';

import styles from './styles.module.css';

type Props = {
    onLinkClick: () => void;
};
const Index: React.FC<Props> = ({ onLinkClick }) => {
    const { events } = useSelector((state: RootReducer) => state.search.data.popularEvents);
    const { isLoading } = useSelector((state: RootReducer) => state.search.ui.popularEvents);

    return (
        <section>
            <div className={styles.title}>Популярные запросы</div>
            {isLoading && <PopularResultSkeleton />}
            <ul className={styles.events}>
                {events.map((actualEvent, i) => {
                    if (!actualEvent) {
                        return null;
                    }

                    const { id, title } = actualEvent.eventPreview;

                    return (
                        <li key={i} className={styles.event}>
                            <Link onClick={onLinkClick} className={styles.link} to={getEventUrl(id)}>
                                {title}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

export default Index;
