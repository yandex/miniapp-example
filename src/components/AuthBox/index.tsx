import React from 'react';

import { useSelector } from 'react-redux';

import { RootReducer } from '../../redux';

import Image from '../Image';
import styles from './styles.module.css';

const AuthBox: React.FC = () => {
    const user = useSelector((state: RootReducer) => state.user.currentUser);
    const username = user.name || 'Войти';

    return (
        <>
            <div className={styles.container}>
                <div className={styles.avatar}>
                    {user.img ? (
                        <Image
                            className={styles['avatar-image']}
                            alt={username}
                            src={user.img.src}
                            src2x={user.img.src2x}
                        />
                    ) : (
                        <span className={[styles['avatar-image'], styles.stub].join(' ')} />
                    )}
                </div>
                <div className={styles.username}>{username}</div>
            </div>
        </>
    );
};

export default AuthBox;
