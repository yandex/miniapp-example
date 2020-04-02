import React, { useState, useEffect, useCallback } from 'react';
import { throttle } from 'throttle-debounce';

const SCROLL_THROTTLE_INTERVAL = 50;

export const useScrollEffect = <TScrollEventTarget extends EventTarget, TPredicateElement extends Element>(
    scrollableRef: React.MutableRefObject<TScrollEventTarget | null>,
    predicateRef: React.MutableRefObject<TPredicateElement | null>,
    predicate: (predicateRef: React.MutableRefObject<TPredicateElement | null>) => boolean
) => {
    const [value, setValue] = useState<boolean>(() => predicate(predicateRef));
    const updateValue = useCallback(
        throttle(SCROLL_THROTTLE_INTERVAL, () => {
            setValue(predicate(predicateRef));
        }),
        [setValue, scrollableRef, predicateRef, predicate]
    );

    useEffect(() => {
        const { current } = scrollableRef;

        current?.addEventListener('scroll', updateValue);

        return () => {
            current?.removeEventListener('scroll', updateValue);
        };
    }, [scrollableRef, predicateRef, updateValue]);

    useEffect(() => {
        updateValue();
    }, [updateValue, scrollableRef, predicateRef]);

    return value;
};
