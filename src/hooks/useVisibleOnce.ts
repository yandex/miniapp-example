import { RefObject, useEffect, useState } from 'react';

export function useVisibleOnce(ref: RefObject<HTMLElement>) {
    // Пока не навешан обработчик на элемент, мы точно не можем сказать видим он или нет,
    // поэтому начальное значение undefined
    const [isVisible, setVisible] = useState<boolean>();

    useEffect(() => {
        if (!ref.current || isVisible) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            setVisible(entry.isIntersecting);
        });

        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };
    }, [ref, isVisible]);

    return isVisible;
}
