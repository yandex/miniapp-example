import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';

import { recommendedEventsSelector, recommendedEventsUISelector } from '../../../../redux/slices/recommended-events';

import EventsFeed from '../EventsFeed';

type Props = {
    skeleton: ReactElement;
};

const Component: React.FC<Props> = ({ skeleton }) => {
    const recommendedEvents = useSelector(recommendedEventsSelector) || {};
    const { isLoading } = useSelector(recommendedEventsUISelector) || {};

    if (isLoading) {
        return skeleton;
    }

    return (
        <>
            <EventsFeed title={'Больше интересных событий'} events={recommendedEvents.top} />
            <EventsFeed title={'Концерты'} events={recommendedEvents.concert} tagCode={'concert'} />
            <EventsFeed title={'Кино'} events={recommendedEvents.cinema} tagCode={'cinema'} />
            <EventsFeed title={'Спектакли'} events={recommendedEvents.theatre} tagCode={'theatre'} />
        </>
    );
};

export default Component;
