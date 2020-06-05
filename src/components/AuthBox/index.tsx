import React, { useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { MediaImageSize } from '../../lib/api/fragments/image-size';
import { RootState } from '../../redux';
import { isAuthenticatedSelector, isAuthorizedSelector, authorize } from '../../redux/slices/user';

import Image from '../Image';
import LoginButton from '../LoginButton';

import styles from './styles.module.css';

const avatarImage: MediaImageSize = {
    url: 'https://api.browser.yandex.ru/userinfo/avatar/islands-middle',
    width: 42,
    height: 42,
};
const avatarImage2x: MediaImageSize = {
    url: 'https://api.browser.yandex.ru/userinfo/avatar/islands-retina-middle',
    width: 84,
    height: 84,
};

const AuthBox: React.FC = () => {
    const dispatch = useDispatch();

    const { currentUser } = useSelector((state: RootState) => state.user);
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

    return (
        <div className={styles.container} onClick={onClick}>
            <Image className={styles.image} alt={name} src={avatarImage} src2x={avatarImage2x} />
            <div className={styles.username}>{name}</div>
        </div>
    );
};

export default AuthBox;
