import React from 'react';

import OrderSkeleton from '../Order/Skeleton';

import EventsListSkeleton from '../../../components/EventsList/Skeleton';

const OrdersScreenSkeleton: React.FC = () => {
    return <EventsListSkeleton count={10} card={OrderSkeleton} />;
};

export default OrdersScreenSkeleton;
