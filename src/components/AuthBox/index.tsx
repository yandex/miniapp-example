import React, { useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { getAvatarUrl, getRetinaAvatarUrl } from '../../lib/url-builder';
import { RootReducer } from '../../redux';
import { loadUserInfo, login } from '../../redux/slices/user';

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
    const { psuid, currentUser: user, authorizedScopes } = useSelector((state: RootReducer) => state.user);
    const dispatch = useDispatch();

    const onClick = useCallback(() => {
        if (psuid && authorizedScopes.length === 0) {
            dispatch(loadUserInfo());
        }
    }, [psuid, authorizedScopes, dispatch]);

    if (!psuid) {
        return <LoginButton />;
    }

    return (
        <div className={styles.container} onClick={onClick}>
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
