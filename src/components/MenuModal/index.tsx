import React, { MouseEvent, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MenuList from '../MenuNavigation';
import AuthBox from '../AuthBox';
import MenuGeoLabel from '../MenuGeoLabel';

import { RootState } from '../../redux';
import { setVisible as setMenuVisible } from '../../redux/slices/menu';
import { isAuthenticatedSelector, logout } from '../../redux/slices/user';

import styles from './style.module.css';

const MenuModal: React.FC<{
    setCityModalVisibleCallback: (visible: boolean) => void;
}> = ({ setCityModalVisibleCallback }) => {
    const dispatch = useDispatch();

    const { visible, items } = useSelector((state: RootState) => state.menu);
    const isAuthenticated = useSelector(isAuthenticatedSelector);
    const { psuid } = useSelector((state: RootState) => state.user);

    const onClose = useCallback(() => {
        setCityModalVisibleCallback(false);
        dispatch(setMenuVisible(false));
    }, [dispatch, setCityModalVisibleCallback]);

    const onModalContentClick = useCallback((e: MouseEvent<HTMLImageElement>) => {
        e.stopPropagation();
    }, []);

    const onLogoutClick = useCallback(() => {
        dispatch(logout());
    }, [dispatch]);

    const className = [styles.modal, visible ? styles.visible : styles.hidden].join(' ');

    return (
        <div className={className} onClick={onClose}>
            <div className={styles.content} onClick={onModalContentClick}>
                <div className={styles.body}>
                    <div className={styles.profile}>
                        <AuthBox />
                    </div>

                    <MenuGeoLabel setCityModalVisibleCallback={setCityModalVisibleCallback} />
                    <MenuList tags={items} onItemClick={onClose} />
                </div>

                {isAuthenticated && (
                    <div className={styles.footer}>
                        <p className={styles.psuid}>PSUID: {psuid}</p>
                        <div className={styles.logout} onClick={onLogoutClick}>
                            Выйти
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuModal;
