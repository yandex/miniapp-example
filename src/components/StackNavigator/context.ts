import { createRef, createContext, RefObject } from 'react';

type StackNavigatorContextType = {
    onBackward: () => void;
    isVisible: boolean;
    ref: RefObject<HTMLDivElement>;
};

export const StackNavigatorContext = createContext<StackNavigatorContextType>({
    onBackward: () => {},
    isVisible: false,
    ref: createRef(),
});
