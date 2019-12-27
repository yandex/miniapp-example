import React, { useEffect, useState } from 'react';

import App from './App';

const polyfillPromises: Promise<void>[] = [];

if (!('IntersectionObserver' in window)) {
    // @ts-ignore
    polyfillPromises.push(import('intersection-observer'));
}
if (!('fetch' in window)) {
    // @ts-ignore
    polyfillPromises.push(import('whatwg-fetch'));
}

const PolyfillApp: React.FC = () => {
    const [canRender, setCanRender] = useState(Boolean(!polyfillPromises.length));

    useEffect(() => {
        if (polyfillPromises.length) {
            Promise.all(polyfillPromises).then(() => setCanRender(true));
        }
    }, []);

    return <>{canRender && <App />}</>;
};

export default PolyfillApp;
