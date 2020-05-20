import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { selectionsSelector, selectionsUISelector, SelectionsState } from '../../redux/slices/selections';
import { actualEventsSelector, actualEventsUISelector } from '../../redux/slices/actual-events';

import LazyRender from '../../components/LazyRender';
import Content from '../../components/Content';
import DateFilter from '../../components/DateFilter';
import SelectionList from '../../components/SelectionList';
import SelectionListSkeleton from '../../components/SelectionList/Skeleton';
import EventsList from '../../components/EventsList';
import EventsListSkeleton from '../../components/EventsList/Skeleton';
import EventCardMain from '../../components/EventCardMain';
import EventCardMainSkeleton from '../../components/EventCardMain/Skeleton';
import { useMetrikaHit } from '../../hooks/useMetrikaHit';

import Title from './Title';

const defaultState: SelectionsState['data']['key'] = {
    items: [],
    updatedAt: 0,
};

const defaultUIState: SelectionsState['ui']['key'] = {
    isLoading: false,
    isUpdating: false,
};

const MainScreen: React.FC = () => {
    const { items: events } = useSelector(actualEventsSelector) || defaultState;
    const { isLoading: isActualEventsLoading } = useSelector(actualEventsUISelector) || defaultUIState;
    const { items: selections } = useSelector(selectionsSelector) || defaultState;
    const { isLoading: isSelectionsLoading } = useSelector(selectionsUISelector) || defaultUIState;

    const actualEventsSkeleton = useMemo(
        () => <EventsListSkeleton itemsGap={8} count={5} card={EventCardMainSkeleton} />,
        []
    );
    const selectionListSkeleton = useMemo(() => <SelectionListSkeleton />, []);

    useMetrikaHit();

    return (
        <>
            <DateFilter />
            <Content>
                <Title>Лучшее</Title>
                {isActualEventsLoading ? (
                    actualEventsSkeleton
                ) : (
                    <EventsList itemsGap={8} items={events} component={EventCardMain} />
                )}

                <Title>Подборки</Title>
                <LazyRender skeleton={selectionListSkeleton}>
                    {isSelectionsLoading ? selectionListSkeleton : <SelectionList items={selections} />}
                </LazyRender>
            </Content>
        </>
    );
};

export default MainScreen;
