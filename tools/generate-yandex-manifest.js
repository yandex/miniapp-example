const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '../build/');
const files = fs.readdirSync(buildDir);
const isIndexFile = path => path.endsWith('/index.html');
const baseUrl = process.env.BASE_URL || 'https://yandex.github.io/miniapp-example/';
const publicUrl = process.env.PUBLIC_URL || 'https://yandex.github.io/miniapp-example';
const appVersion = generateVersion();

const precache = files.find(file => file.match(/precache/));
if (!precache) {
    throw Error('precache file not found');
}

global.self = {};
require(`${buildDir}/${precache}`);
const assets = self.__precacheManifest;

const filesToCache = assets.map(asset => asset.url).filter(path => !isIndexFile(path));

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
    start_url: baseUrl,
    display: 'standalone',
    theme_color: '#000000',
    background_color: '#ffffff',
    yandex: {
        manifest_version: 1,
        app_version: appVersion,
        base_url: baseUrl,
        splash_screen_color: '#f0f3f5',
        cache: {
            resources: [baseUrl, ...filesToCache],
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
