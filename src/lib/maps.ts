type StaticMapUrlOptions = {
    size: [number, number];
    z: number;
    ll?: [number, number];
    pt?: [number, number, 'pm2rdl'];
};

export function getStaticMapUrl(options: StaticMapUrlOptions) {
    const params = new URLSearchParams({ l: 'map' });

    for (const [key, value] of Object.entries(options)) {
        params.set(key, String(value));
    }

    return `//static-maps.yandex.ru/1.x/?${params}`;
}
