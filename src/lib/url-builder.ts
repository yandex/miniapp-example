type QueryParams = Record<string, string>;

export function getMainPageUrl() {
    return '/';
}

export function getEventUrl(id: string) {
    return `/event/${id}`;
}

export function getEventGalleryUrl(id: string, query: QueryParams) {
    const params = query ? `?${new URLSearchParams(query)}` : '';

    return `/event/${id}/gallery${params}`;
}

export function getRubricUrl(code: string) {
    return `/events/${encodeURIComponent(code)}`;
}

export function getSelectionUrl(code: string) {
    return `/selection/${encodeURIComponent(code)}`;
}

export function getSearchUrl() {
    return '/search';
}

export function getOrdersUrl() {
    return '/orders';
}
