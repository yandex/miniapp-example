import React, { useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyDeferred } from '../../lib/lazy';
import { RootState } from '../../redux';
import { loadActualEvents } from '../../redux/slices/actual-events';
import { loadSelections } from '../../redux/slices/selections';

import PageHeader from '../../components/PageHeader';

import MainScreenSkeleton from './Skeleton';

const Component = lazyDeferred(() =>
    import(
        /* webpackChunkName: "main-screen" */
        './Component'
    )
);

const MainScreen: React.FC = () => {
    const dispatch = useDispatch();
    const date = useSelector((state: RootState) => state.dateFilter);
    const { geoid } = useSelector((state: RootState) => state.city.currentCity);

    useEffect(() => {
        dispatch(loadActualEvents(date, geoid));
        dispatch(loadSelections(date, geoid));
    }, [dispatch, date, geoid]);

    return (
        <>
            <PageHeader hasLogo hasMenu />
            <Suspense fallback={<MainScreenSkeleton />}>
                <Component />
            </Suspense>
        </>
    );
};

export default MainScreen;
