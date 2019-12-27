import { useEffect, useState } from 'react';

export function useThrottleLoading(isLoading: boolean, time: number) {
    const [isThrottleLoading, setThrottleLoading] = useState(false);

    // Задерживаем отрисовку на некоторое время после начала загрузки данных.
    // Тем самым исключим моргание между заглушкой и рендером основного компонента
    useEffect(() => {
        if (isLoading) {
            const newTimerId = window.setTimeout(() => setThrottleLoading(true), time);

            return () => clearTimeout(newTimerId);
        }

        setThrottleLoading(false);
    }, [isLoading, time]);

    return isThrottleLoading;
}
