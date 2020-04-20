import React, { MouseEvent, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MenuList from '../MenuNavigation';
import AuthBox from '../AuthBox';
import MenuGeoLabel from '../MenuGeoLabel';

import { RootReducer } from '../../redux';
import { cleanup } from '../../redux/actions';
import { setVisible as setMenuVisible } from '../../redux/slices/menu';

import styles from './style.module.css';

const MenuModal: React.FC<{
    setCityModalVisibleCallback: (visible: boolean) => void;
}> = ({ setCityModalVisibleCallback }) => {
    const dispatch = useDispatch();

    const { visible, items } = useSelector((state: RootReducer) => state.menu);
    const { psuid } = useSelector((state: RootReducer) => state.user);
    const [wasClosed, setWasClosed] = useState<boolean>(false);
    const className = [
        styles['menu-modal'],
        visible || wasClosed ? styles[`menu-modal-visible_${visible ? 'yes' : 'no'}`] : '',
    ].join(' ');

    const onClose = useCallback(() => {
        setWasClosed(true);
        setCityModalVisibleCallback(false);
        dispatch(setMenuVisible(false));
    }, [dispatch, setWasClosed, setCityModalVisibleCallback]);

    const noop = useCallback((e: MouseEvent<HTMLImageElement>) => {
        e.stopPropagation();
    }, []);

    const onLogoutClick = useCallback(() => {
        dispatch(cleanup());
    }, [dispatch]);

    return (
        <div className={className} onClick={onClose}>
            <div className={styles['menu-modal-content']} onClick={noop}>
                <div className={styles['menu-modal-body']}>
                    <AuthBox />
                    <MenuGeoLabel setCityModalVisibleCallback={setCityModalVisibleCallback} />
                    <MenuList tags={items} onItemClick={onClose} />
                </div>
                <div className={styles['menu-modal-footer']}>
                    {psuid && (
                        <>
                            <p className={styles.psuid}>PSUID: {psuid}</p>
                            <div className={styles.logout} onClick={onLogoutClick}>Выйти</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuModal;
