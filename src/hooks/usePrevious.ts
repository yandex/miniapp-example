import { useRef, useEffect } from 'react';

export function usePrevious<T>(value: T) {
    const previousValue = useRef<T>();

    useEffect(() => {
        previousValue.current = value;
    }, [value]);

    return previousValue.current;
}
