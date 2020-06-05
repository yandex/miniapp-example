import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../../redux';
import {
    loadMoreRubricEvents,
    rubricEventsSelector,
    RubricEventsState,
    rubricEventsUISelector,
} from '../../redux/slices/rubric-events';

import Content from '../../components/Content';
import RubricTitle from '../../components/RubricTitle';
import RubricTitleSkeleton from '../../components/RubricTitle/Skeleton';
import EventsList from '../../components/EventsList';
import EventsListSkeleton from '../../components/EventsList/Skeleton';
import EventCard from '../../components/EventCard';
import EventCardSkeleton from '../../components/EventCard/Skeleton';
import DateFilter from '../../components/DateFilter';
import { useMetrikaHit } from '../../hooks/useMetrikaHit';

const defaultState: RubricEventsState['data']['key'] = {
    title: '',
    events: {
        items: [],
        paging: { offset: 0, total: 0 },
    },
    hasMoreItems: false,
    updatedAt: 0,
};
const defaultUIState: RubricEventsState['ui']['key'] = {
    isLoading: false,
    isLoadingMore: false,
    isUpdating: false,
};

type Props = {
    code: string;
};

const RubricScreen: React.FC<Props> = ({ code }) => {
    const dispatch = useDispatch();
    const { events, hasMoreItems, title } = useSelector(rubricEventsSelector(code)) || defaultState;
    const { isLoading, isLoadingMore } = useSelector(rubricEventsUISelector(code)) || defaultUIState;
    const date = useSelector((state: RootState) => state.dateFilter);

    const onLoadMore = useCallback(() => {
        dispatch(loadMoreRubricEvents(code, date));
    }, [dispatch, code, date]);

    useMetrikaHit();

    return (
        <>
            <DateFilter />
            <Content>
                {isLoading ? (
                    <>
                        <RubricTitleSkeleton />
                        <EventsListSkeleton count={10} card={EventCardSkeleton} />
                    </>
                ) : (
                    <>
                        <RubricTitle>{title}</RubricTitle>
                        <EventsList
                            type="loadable"
                            hasMore={hasMoreItems}
                            loadMore={onLoadMore}
                            isLoadingMore={isLoadingMore}
                            items={events.items}
                            pageSize={10}
                            component={EventCard}
                            skeleton={<EventsListSkeleton count={3} card={EventCardSkeleton} />}
                        />
                    </>
                )}
            </Content>
        </>
    );
};

export default RubricScreen;
