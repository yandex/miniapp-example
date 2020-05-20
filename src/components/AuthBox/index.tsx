import React, { useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { getAvatarUrl, getRetinaAvatarUrl } from '../../lib/url-builder';
import { RootReducer } from '../../redux';
import { isAuthorizedSelector, login } from '../../redux/slices/user';

import Image from '../Image';

import styles from './styles.module.css';

const LoginButton: React.FC = () => {
    const dispatch = useDispatch();

    const onLoginClick = useCallback(() => {
        dispatch(login());
    }, [dispatch]);

    return (
        <div className={styles.anonymous}>
            <span className={styles.stub} />
            <div onClick={onLoginClick}>
                Войти
            </div>
        </div>
    );
};

const AuthBox: React.FC = () => {
    const { currentUser: user } = useSelector((state: RootReducer) => state.user);
    const isAuthorized = useSelector(isAuthorizedSelector);

    if (!isAuthorized) {
        return <LoginButton />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.avatar}>
                {user.avatar_id ? (
                    <Image
                        className={styles['avatar-image']}
                        alt={user.display_name}
                        src={getAvatarUrl(user.avatar_id)}
                        src2x={getRetinaAvatarUrl(user.avatar_id)}
                    />
                ) : (
                    <span className={[styles['avatar-image'], styles.stub].join(' ')} />
                )}
            </div>
            <div className={styles.username}>{user.display_name || 'Аноним'}</div>
        </div>
    );
};

export default AuthBox;
