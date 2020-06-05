import React, { useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyDeferred } from '../../lib/lazy';
import { RootState } from '../../redux';
import { loadRubricEvents } from '../../redux/slices/rubric-events';

import PageHeader from '../../components/PageHeader';
import SelectionScreenSkeleton from '../SelectionScreen/Skeleton';

const Component = lazyDeferred(() =>
    import(
        /* webpackChunkName: "rubric-screen" */
        './Component'
    )
);

const RubricScreen: React.FC<{ code: string }> = ({ code }) => {
    const dispatch = useDispatch();
    const date = useSelector((state: RootState) => state.dateFilter);

    useEffect(() => {
        dispatch(loadRubricEvents(code, date));
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

export default RubricScreen;
