import React, { ReactElement, useRef } from 'react';

import { ActualEvent } from '../../lib/api/fragments/actual-event';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { usePaginatedList } from '../../hooks/usePaginatedList';

import { DEFAULT_ITEMS_GAP } from './constants';

import styles from './style.module.css';

type BaseProps = {
    items: Array<ActualEvent | null>;
    component: React.FC<{ event: ActualEvent; onClick?: () => void }>;
    onItemClick?: () => void;
    itemsGap?: number;
};

type StaticProps = BaseProps & {
    type?: 'static';
};

type LoadableProps = BaseProps & {
    type: 'loadable';
    pageSize: number;
    loadMore: () => void;
    hasMore: boolean;
    isLoadingMore: boolean;
    skeleton: ReactElement;
};

type Props = StaticProps | LoadableProps;

const EventsList: React.FC<Props> = props => {
    const { itemsGap = DEFAULT_ITEMS_GAP } = props;

    if (props.type === 'loadable') {
        return <EventsListLoadable {...props} />;
    }

    return (
        <div className={styles.list} style={{ gridGap: `${itemsGap}px` }}>
            <EventsListItems {...props} />
        </div>
    );
};

const EventsListLoadable: React.FC<LoadableProps> = props => {
    const { itemsGap = DEFAULT_ITEMS_GAP } = props;
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const [events, hasMore, loadMore] = usePaginatedList({
        items: props.items,
        hasMore: props.hasMore,
        loadMore: props.loadMore,
        pageSize: props.pageSize,
    });

    useInfiniteScroll({
        ref: loadMoreRef,
        isLoading: props.isLoadingMore,
        hasMore,
        loadMore,
        threshold: 200,
    });

    return (
        <div className={styles.list} style={{ gridGap: `${itemsGap}px` }}>
            <EventsListItems {...props} items={events} />
            {props.isLoadingMore && props.skeleton}
            <div ref={loadMoreRef} />
        </div>
    );
};

const EventsListItems: React.FC<BaseProps> = props => {
    return (
        <>
            {props.items.map((actualEvent, index) => {
                if (!actualEvent) {
                    return null;
                }

                return <props.component key={index} event={actualEvent} onClick={props.onItemClick} />;
            })}
        </>
    );
};

export default EventsList;
