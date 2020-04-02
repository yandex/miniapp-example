export const isIOS = (): boolean =>
    (/iPad|iPhone|iPod/.test(navigator.platform) ||
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !window.MSStream;
