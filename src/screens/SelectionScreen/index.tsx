import React, { useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyDeferred } from '../../lib/lazy';
import { RootReducer } from '../../redux';
import { loadSelectionEvents } from '../../redux/slices/selection-events';

import PageHeader from '../../components/PageHeader';

import SelectionScreenSkeleton from './Skeleton';

const Component = lazyDeferred(() =>
    import(
        /* webpackChunkName: "selection-screen" */
        './Component'
    )
);

const SelectionScreen: React.FC<{ code: string }> = ({ code }) => {
    const dispatch = useDispatch();
    const date = useSelector((state: RootReducer) => state.dateFilter);

    useEffect(() => {
        dispatch(loadSelectionEvents(code, date));
    }, [dispatch, code, date]);

    return (
        <>
            <PageHeader hasLogo hasMenu />
            <Suspense fallback={<SelectionScreenSkeleton />}>
                <Component code={code} />
            </Suspense>
        </>
    );
};

export default SelectionScreen;
