import React, { useCallback } from 'react';

import { useDispatch } from 'react-redux';

import { login } from '../../redux/slices/user';

import styles from './styles.module.css';

const LoginButton: React.FC = () => {
    const dispatch = useDispatch();

    const onLoginClick = useCallback(() => {
        dispatch(login());
    }, [dispatch]);

    return (
        <div className={styles.container} onClick={onLoginClick}>
            <button className={styles.button}>Войти</button>
        </div>
    );
};

export default LoginButton;
