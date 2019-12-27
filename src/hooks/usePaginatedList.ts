import { useCallback, useMemo, useState } from 'react';

type PaginatedListOptions<T> = {
    items: T[];
    hasMore: boolean;
    loadMore: () => void;
    pageSize: number;
};

export function usePaginatedList<T>(options: PaginatedListOptions<T>): [T[], boolean, () => void] {
    const { items, hasMore, loadMore, pageSize } = options;

    const [limit, setLimit] = useState(pageSize);
    const events = useMemo(() => items.slice(0, limit), [items, limit]);

    const wrappedLoadMore = useCallback(() => {
        if (items.length > limit) {
            setLimit(limit + pageSize);
        } else {
            loadMore();
        }
    }, [loadMore, limit, pageSize, items]);

    const wrappedHasMore = hasMore || limit < items.length;

    return [events, wrappedHasMore, wrappedLoadMore];
}
