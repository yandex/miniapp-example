/* eslint-disable */
(function() {
    'use strict';

    var isBeaconAvailable = Boolean(
        window.yandex &&
        window.yandex.navigator &&
        window.yandex.navigator.sendPersistentBeacon
    );
    var scriptName = isBeaconAvailable ? 'tag_turboapp.js' : 'tag.js';

    window.ym = function() {
        (window.ym.a = window.ym.a || []).push(arguments);
    }
    window.ym.l = Number(new Date());

    var metrikaScript = document.createElement('script');
    metrikaScript.src = 'https://mc.yandex.ru/metrika/' + scriptName;
    metrikaScript.async = true;

    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(metrikaScript, firstScript);
})();
