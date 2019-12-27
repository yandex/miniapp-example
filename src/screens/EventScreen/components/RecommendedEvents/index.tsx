import React, { memo } from 'react';

import { lazyDeferred } from '../../../../lib/lazy';

import LazyBlock from '../../../../components/LazyBlock';
import RecommendedEventsSkeleton from './Skeleton';

const Component = lazyDeferred(() =>
    import(
        /* webpackChunkName: "recommended-events" */
        './Component'
    )
);

const RecommendedEventsLazyBlock: React.FC = () => {
    return (
        <LazyBlock skeleton={<RecommendedEventsSkeleton />}>
            <Component skeleton={<RecommendedEventsSkeleton />} />
        </LazyBlock>
    );
};

export default memo(RecommendedEventsLazyBlock);
