import { RefObject, useEffect, useState } from 'react';

export function useVisibleOnce(ref: RefObject<HTMLElement>, options?: IntersectionObserverInit) {
    // Пока не навешан обработчик на элемент, мы точно не можем сказать видим он или нет,
    // поэтому начальное значение undefined
    const [isVisible, setVisible] = useState<boolean>();

    useEffect(() => {
        if (!ref.current || isVisible) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            setVisible(entry.isIntersecting);
        }, options);

        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };
    }, [ref, options, isVisible]);

    return isVisible;
}
