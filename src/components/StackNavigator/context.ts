import { createContext } from 'react';

type StackNavigatorContextType = {
    onBackward: () => void;
};

export const StackNavigatorContext = createContext<StackNavigatorContextType>({
    onBackward: () => {},
});
