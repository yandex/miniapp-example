import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../../redux';
import {
    loadMoreSelectionEvents,
    selectionEventsSelector,
    SelectionEventsState,
    selectionEventsUISelector,
} from '../../redux/slices/selection-events';

import Content from '../../components/Content';
import RubricTitle from '../../components/RubricTitle';
import RubricTitleSkeleton from '../../components/RubricTitle/Skeleton';
import EventsList from '../../components/EventsList';
import EventsListSkeleton from '../../components/EventsList/Skeleton';
import EventCard from '../../components/EventCard';
import EventCardSkeleton from '../../components/EventCard/Skeleton';
import DateFilter from '../../components/DateFilter';
import { useMetrikaHit } from '../../hooks/useMetrikaHit';

const defaultState: SelectionEventsState['data']['key'] = {
    title: '',
    events: {
        items: [],
        paging: { offset: 0, total: 0 },
    },
    hasMoreItems: false,
    updatedAt: 0,
};
const defaultUIState: SelectionEventsState['ui']['key'] = {
    isLoading: false,
    isLoadingMore: false,
    isUpdating: false,
};

type Props = {
    code: string;
};

const SelectionScreen: React.FC<Props> = ({ code }) => {
    const dispatch = useDispatch();

    const date = useSelector((state: RootState) => state.dateFilter);
    const { title, events, hasMoreItems } = useSelector(selectionEventsSelector(code)) || defaultState;
    const { isLoading, isLoadingMore } = useSelector(selectionEventsUISelector(code)) || defaultUIState;

    const onMoreClick = useCallback(() => {
        dispatch(loadMoreSelectionEvents(code, date));
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
                            loadMore={onMoreClick}
                            hasMore={hasMoreItems}
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

export default SelectionScreen;
