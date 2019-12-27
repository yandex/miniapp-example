import { RefObject, useEffect, useMemo } from 'react';

import { useVisible } from './useVisible';

type InfiniteScrollOptions = {
    ref: RefObject<HTMLElement>;
    isLoading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    threshold?: number;
};

export function useInfiniteScroll({ threshold, ref, isLoading, loadMore, hasMore }: InfiniteScrollOptions) {
    const options = useMemo<IntersectionObserverInit>(() => {
        return {
            rootMargin: `0px 0px ${threshold || 0}px 0px`,
        };
    }, [threshold]);

    const needLoadMore = useVisible(ref, options) || false;

    useEffect(() => {
        if (!hasMore) return;
        if (isLoading) return;

        if (needLoadMore) {
            loadMore();
        }
    }, [needLoadMore, loadMore, hasMore, isLoading]);
}
