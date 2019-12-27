import React, { ChangeEvent } from 'react';

import Checkbox from '../Checkbox';
import ActionButton from '../ActionButton';
import { City } from '../CityModal';

import styles from './styles.module.css';

type CityChangeProps = {
    visible: boolean;
    wasClosed: boolean;
    useGeolocation: boolean;
    openCityModal: () => void;
    onSaveClick: () => void;
    onGeolocationChanged: (event: ChangeEvent<HTMLInputElement>) => void;
    selectedCity: City;
};

const CityChange: React.FC<CityChangeProps> = ({
    visible,
    openCityModal,
    wasClosed,
    onSaveClick,
    useGeolocation,
    onGeolocationChanged,
    selectedCity,
}) => {
    const className = [
        styles.wrapper,
        visible || wasClosed ? styles[`wrapper-visible_${visible ? 'yes' : 'no'}`] : '',
    ].join(' ');

    return (
        <div className={className}>
            <div className={styles.title}>Выбрать город</div>
            <div className={styles['auto-select-box']}>
                <Checkbox checked={useGeolocation} onChange={onGeolocationChanged} label={'Определять автоматически'} />
            </div>
            <div className={styles.selected}>
                <div className={styles['selected-city-label']}>Город</div>
                <div className={styles['selected-city-name']} onClick={openCityModal}>
                    {selectedCity.name}
                </div>
            </div>
            <ActionButton className={styles.button} onClick={onSaveClick}>
                Сохранить
            </ActionButton>
        </div>
    );
};

export default CityChange;
