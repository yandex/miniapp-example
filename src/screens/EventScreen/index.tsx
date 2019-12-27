import React, { useEffect, Suspense } from 'react';
import { useDispatch } from 'react-redux';

import { lazyDeferred } from '../../lib/lazy';
import { loadEvent } from '../../redux/slices/event';
import { loadRecommendedEvents } from '../../redux/slices/recommended-events';

import EventSkeleton from './Skeleton';

const Component = lazyDeferred(() =>
    import(
        /* webpackChunkName: "event-screen" */
        './Component'
    )
);

const EventScreen: React.FC<{ id: string }> = ({ id }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadEvent(id));
        dispatch(loadRecommendedEvents());
    }, [dispatch, id]);

    return (
        <>
            <Suspense fallback={<EventSkeleton />}>
                <Component id={id} skeleton={<EventSkeleton />} />
            </Suspense>
        </>
    );
};

export default EventScreen;
