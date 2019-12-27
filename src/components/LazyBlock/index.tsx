import React, { useEffect, Suspense, ReactElement, ReactNode } from 'react';

import LazyRender from '../LazyRender';

type Props = {
    children: ReactNode;
    fetchData?: () => void;
    skeleton?: ReactElement;
};

const LazyBlock: React.FC<Props> = ({ children, skeleton, fetchData }) => {
    return (
        <LazyRender skeleton={skeleton}>
            <Inner children={children} skeleton={skeleton} fetchData={fetchData} />
        </LazyRender>
    );
};

const Inner: React.FC<Props> = ({ children, skeleton, fetchData }) => {
    useEffect(() => {
        fetchData && fetchData();
    }, [fetchData]);

    return <Suspense fallback={skeleton || null}>{children}</Suspense>;
};

export default LazyBlock;
