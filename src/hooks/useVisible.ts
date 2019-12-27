import { RefObject, useLayoutEffect, useState, useRef } from 'react';

export function useVisible(ref: RefObject<HTMLElement>, options?: IntersectionObserverInit) {
    // Пока не навешан обработчик на элемент, мы точно не можем сказать видим он или нет,
    // поэтому начальное значение undefined
    const [isVisible, setVisible] = useState<boolean>();
    const optionsRef = useRef(options);

    useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }

        if (options !== optionsRef.current && process.env.NODE_ENV === 'development') {
            optionsRef.current = options;

            console.warn(
                '[useVisible] Изменились опции для IntersectionObserver. Это может приводить к существенному падению производительности при скролле.'
            );
        }

        const observer = new IntersectionObserver(([entry]) => {
            setVisible(entry.isIntersecting);
        }, options);

        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };
    }, [ref, options]);

    return isVisible;
}
