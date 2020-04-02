import React, { useRef, ReactElement, useState, useEffect } from 'react';

import { useVisibleOnce } from '../../hooks/useVisibleOnce';

type Props = {
    children: ReactElement;
    skeleton?: ReactElement;
    intersectionOptions?: IntersectionObserverInit;
};

const LazyRender: React.FC<Props> = ({ children, skeleton, intersectionOptions }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const canRender = useVisibleOnce(ref, intersectionOptions);
    const [needSkeleton, showSkeleton] = useState(false);

    useEffect(() => {
        if (!canRender) {
            showSkeleton(true);
        }
    }, [canRender]);

    return <div ref={ref}>{canRender ? children : needSkeleton && skeleton}</div>;
};

export default LazyRender;
