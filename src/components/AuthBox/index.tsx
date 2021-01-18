import React, { useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { MediaImageSize } from '../../lib/api/fragments/image-size';
import { userSelector, isAuthenticatedSelector, isAuthorizedSelector, authorize } from '../../redux/slices/user';

import Image from '../Image';
import LoginButton from '../LoginButton';

import styles from './styles.module.css';

const getAvatarImage = (avatarId: string): MediaImageSize => ({
    url: `https://avatars.yandex.net/get-yapic/${avatarId}/islands-middle`,
    width: 42,
    height: 42,
});
const getAvatarImage2x = (avatarId: string): MediaImageSize => ({
    url: `https://avatars.yandex.net/get-yapic/${avatarId}/islands-retina-middle`,
    width: 84,
    height: 84,
});

const AuthBox: React.FC = () => {
    const dispatch = useDispatch();

    const currentUser = useSelector(userSelector);
    const isAuthenticated = useSelector(isAuthenticatedSelector);
    const isAuthorized = useSelector(isAuthorizedSelector);

    const onClick = useCallback(() => {
        if (!isAuthorized) {
            dispatch(authorize());
        }
    }, [dispatch, isAuthorized]);

    if (!isAuthenticated) {
        return <LoginButton />;
    }

    const name = currentUser.display_name || 'Профиль';
    const avatarId = currentUser.avatar_id || 'default';

    return (
        <div className={styles.container} onClick={onClick}>
            <Image
                className={styles.image}
                alt={name}
                src={getAvatarImage(avatarId)}
                src2x={getAvatarImage2x(avatarId)}
            />
            <div className={styles.username}>{name}</div>
        </div>
    );
};

export default AuthBox;
