import React from 'react';

import { EventsFeedSkeleton } from '../../EventsFeed/Skeleton';

const RecommendedEventsSkeleton: React.FC = () => {
    return (
        <>
            <EventsFeedSkeleton />
            <EventsFeedSkeleton />
            <EventsFeedSkeleton />
            <EventsFeedSkeleton />
        </>
    );
};

export default RecommendedEventsSkeleton;
