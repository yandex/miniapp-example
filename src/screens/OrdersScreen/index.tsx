import React, { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyDeferred } from '../../lib/lazy';
import { loadEvent } from '../../redux/slices/event';
import { fetchOrders, orderEventIdsSelector } from '../../redux/slices/order';

import PageHeader from '../../components/PageHeader';

import OrdersScreenSkeleton from './Skeleton';

const Component = lazyDeferred(() =>
    import(
        /* webpackChunkName: "orders-screen" */
        './Component'
    )
);

const OrdersScreen: React.FC = () => {
    const dispatch = useDispatch();
    const eventIds = useSelector(orderEventIdsSelector);

    const skeleton = <OrdersScreenSkeleton />;

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    useEffect(() => {
        eventIds.forEach(id => {
            dispatch(loadEvent(id));
        });
    }, [eventIds, dispatch]);

    return (
        <>
            <PageHeader
                backward="black"
                hasLogo={false}
                hasMenu={false}
                text="Мои заказы"
            />
            <Suspense fallback={skeleton}>
                <Component skeleton={skeleton} />
            </Suspense>
        </>
    );
};

export default OrdersScreen;
