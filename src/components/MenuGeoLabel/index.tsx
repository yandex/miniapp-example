import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../redux';

import styles from './styles.module.css';

const MenuGeoLabel: React.FC<{
    setCityModalVisibleCallback: (visible: boolean) => void;
}> = ({ setCityModalVisibleCallback }) => {
    const currentCity = useSelector((state: RootState) => state.city.currentCity);
    const onCitySelectLabelClickHandle = useCallback(() => {
        setCityModalVisibleCallback(true);
    }, [setCityModalVisibleCallback]);

    return (
        <div className={styles.wrapper}>
            <div className={styles.select} onClick={onCitySelectLabelClickHandle}>
                {currentCity ? currentCity.name : 'Выбрать город'}
            </div>
        </div>
    );
};

export default MenuGeoLabel;
