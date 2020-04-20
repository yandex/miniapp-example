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

function getAvatarUrlByPath(avatarId: string, path: string) {
    const defaultId = '0/0-0';

    return `https://avatars.mds.yandex.net/get-yapic/${avatarId || defaultId}${path}`;
}

export function getAvatarUrl(avatarId: string) {
    return {
        url: getAvatarUrlByPath(avatarId, '/islands-middle'),
        width: 42,
        height: 42,
    };
}

export function getRetinaAvatarUrl(avatarId: string) {
    return {
        url: getAvatarUrlByPath(avatarId, '/islands-retina-middle'),
        width: 84,
        height: 84,
    };
}
