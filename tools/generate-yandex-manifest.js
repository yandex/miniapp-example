const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '../build/');
const publicUrl = process.env.PUBLIC_URL || '';
const startUrl = process.env.BASE_URL || `${publicUrl}/`;
const appVersion = generateVersion();

const getFileUrls = ({ dir, baseUrl, extensions }) => {
    return fs
        .readdirSync(dir)
        .filter(file => !extensions || extensions.includes(path.extname(file)))
        .map(file => `${baseUrl}/${file}`);
};

const manifest = {
    name: 'MiniApp Example',
    short_name: 'MiniApp',
    description: 'MiniApp Example',
    icons: [
        {
            src: `${publicUrl}/favicon.ico`,
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
        },
        {
            src: `${publicUrl}/logo192.png`,
            sizes: '192x192',
            type: 'image/png',
        },
        {
            src: `${publicUrl}/logo512.png`,
            sizes: '512x512',
            type: 'image/png',
        },
    ],
    lang: 'ru',
    start_url: startUrl,
    display: 'standalone',
    theme_color: '#000000',
    background_color: '#ffffff',
    yandex: {
        manifest_version: 1,
        app_id: '100375',
        app_version: appVersion,
        client_id: '9e445c9aacec4266bf265302facb8293',
        metrika_id: 62405404,
        base_url: startUrl,
        splash_screen_color: '#f0f3f5',
        cache: {
            resources: [
                startUrl,
                'https://mc.yandex.ru/metrika/tag_turboapp.js',
                ...getFileUrls({
                    dir: `${buildDir}/static/js`,
                    baseUrl: `${publicUrl}/static/js`,
                    extensions: ['.js'],
                }),
                ...getFileUrls({
                    dir: `${buildDir}/static/css`,
                    baseUrl: `${publicUrl}/static/css`,
                    extensions: ['.css'],
                }),
                ...getFileUrls({
                    dir: `${buildDir}/static/media`,
                    baseUrl: `${publicUrl}/static/media`,
                }),
            ],
        },
    },
};
fs.writeFileSync(`${buildDir}/manifest.json`, JSON.stringify(manifest, null, 2));

function generateVersion() {
    const date = new Date();
    const format = value => (value < 10 ? `0${value}` : value);

    const YYYY = date.getFullYear();
    const DD = format(date.getDate());
    const MM = format(date.getMonth() + 1);
    const hh = format(date.getHours());
    const mm = format(date.getMinutes());

    return `${YYYY}${MM}${DD}.${hh}${mm}`;
}
