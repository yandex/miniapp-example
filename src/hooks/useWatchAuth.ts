import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { checkUser } from '../redux/slices/user';

export function useWatchAuth() {
    const dispatch = useDispatch();

    // Проверяем авторизацию на старте приложения
    useEffect(() => {
        dispatch(checkUser());
    }, [dispatch]);

    // При переключении владок браузера пользователь мог сменить логин, поэтому проверяем авторизацию
    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                dispatch(checkUser());
            }
        };

        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, [dispatch]);
}
