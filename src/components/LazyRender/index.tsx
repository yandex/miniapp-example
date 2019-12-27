import React, { useRef, ReactElement, useState, useEffect } from 'react';

import { useVisibleOnce } from '../../hooks/useVisibleOnce';

type Props = {
    children: ReactElement;
    skeleton?: ReactElement;
};

const LazyRender: React.FC<Props> = ({ children, skeleton }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const canRender = useVisibleOnce(ref);
    const [needSkeleton, showSkeleton] = useState(false);

    useEffect(() => {
        if (!canRender) {
            showSkeleton(true);
        }
    }, [canRender]);

    if (!canRender) {
        return <div ref={ref}>{needSkeleton && skeleton}</div>;
    }

    return children;
};

export default LazyRender;
