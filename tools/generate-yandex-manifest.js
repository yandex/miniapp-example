const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '../build/');
const files = fs.readdirSync(buildDir);
const indexFilePath = '/index.html';

const precache = files.find(file => file.match(/precache/));
if (!precache) {
    throw Error('precache file not found');
}

const generateVersion = () => {
    const date = new Date();
    const format = value => (value < 10 ? `0${value}` : value);

    const YYYY = date.getFullYear();
    const DD = format(date.getDate());
    const MM = format(date.getMonth() + 1);
    const hh = format(date.getHours());
    const mm = format(date.getMinutes());

    return `${YYYY}${MM}${DD}.${hh}${mm}`;
};

global.self = {};
require(`${buildDir}/${precache}`);
const assets = self.__precacheManifest;

const filesToCache = assets.map(asset => asset.url);

const manifest = {
    lang: 'ru',
    name: 'MiniApp Example',
    short_name: 'MiniApp',
    description: 'MiniApp Example',
    icons: [
        {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
        },
        {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png',
        },
        {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
        },
    ],
    yandex: {
        manifest_version: 1,
        app_version: generateVersion(),
        cache: {
            resources: filesToCache.filter(path => path !== indexFilePath),
        },
    },
};
fs.writeFileSync(`${buildDir}/yandex-manifest.json`, JSON.stringify(manifest, null, 2));
