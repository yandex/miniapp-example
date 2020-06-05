import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useClickAway } from 'react-use';

import { RootState } from '../../redux';
import { setCity as saveCity, toggleGeolocation, loadCityInfo, City as stateCity } from '../../redux/slices/city';
import { usePrevious } from '../../hooks/usePrevious';

import CityChange from '../CityChange';
import CitySelect from '../CitySelect';

import styles from './styles.module.css';

export type City = stateCity['currentCity'];

const CityModal: React.FC<{
    visible: boolean;
    setCityModalVisibleCallback: (visible: boolean) => void;
}> = ({ visible: isModalVisible, setCityModalVisibleCallback: setModalVisible }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();
    const history = useHistory();

    const currentCity = useSelector((state: RootState) => state.city.currentCity);
    const useGeolocation = useSelector((state: RootState) => state.city.useGeolocation);

    const previousCity = usePrevious<City>(currentCity);

    const [selectedCity, selectCity] = useState<City>(currentCity);

    const [wasClosed, setWasClosed] = useState<boolean>(false);
    const [wasClosedModalChange, setWasClosedModalChange] = useState<boolean>(false);
    const [wasClosedModalSelect, setWasClosedModalSelect] = useState<boolean>(false);
    const [visibleModalChange, setVisibleModalChange] = useState<boolean>(false);
    const [visibleModalSelect, setVisibleModalSelect] = useState<boolean>(false);

    const className = [
        styles['city-modal'],
        isModalVisible || wasClosed ? styles[`city-modal-visible_${isModalVisible ? 'yes' : 'no'}`] : '',
    ].join(' ');

    useEffect(() => {
        setVisibleModalChange(isModalVisible);
    }, [setVisibleModalChange, isModalVisible]);

    useEffect(() => {
        selectCity(currentCity);

        if (previousCity && previousCity.name !== currentCity.name) {
            console.warn('Go to `/` route');

            history.replace('/');
        }
    }, [selectCity, currentCity, previousCity, history]);

    const onGeolocationChanged = useCallback(
        e => {
            const isChecked = e.target.checked;

            dispatch(toggleGeolocation(isChecked));
        },
        [dispatch]
    );

    const onClose = useCallback(() => {
        if (selectedCity.name !== currentCity.name) {
            selectCity(currentCity);
        }

        setWasClosed(true);
        setVisibleModalSelect(false);
        setVisibleModalChange(false);
        setModalVisible(false);
    }, [
        selectedCity,
        currentCity,
        selectCity,
        setWasClosed,
        setVisibleModalSelect,
        setVisibleModalChange,
        setModalVisible,
    ]);

    const onSaveClick = useCallback(() => {
        setWasClosed(true);
        setVisibleModalChange(false);
        setModalVisible(false);

        dispatch(saveCity(selectedCity));

        if (selectedCity.name !== currentCity.name) {
            dispatch(loadCityInfo());
        }
    }, [setVisibleModalChange, setModalVisible, dispatch, selectedCity, currentCity]);

    const onCitySelect = useCallback(
        (city: City) => {
            selectCity(city);
            setWasClosedModalSelect(true);
            setVisibleModalSelect(false);
            setVisibleModalChange(true);

            dispatch(toggleGeolocation(false));
        },
        [dispatch, selectCity, setWasClosedModalSelect, setVisibleModalSelect, setVisibleModalChange]
    );

    const openCityModal = useCallback(() => {
        setWasClosedModalChange(true);
        setVisibleModalSelect(true);
        setVisibleModalChange(false);
    }, [setWasClosedModalChange, setVisibleModalSelect, setVisibleModalChange]);

    useClickAway(contentRef, onClose);

    return (
        <div className={className}>
            {isModalVisible && (
                <div ref={contentRef}>
                    <CityChange
                        visible={visibleModalChange}
                        openCityModal={openCityModal}
                        onGeolocationChanged={onGeolocationChanged}
                        useGeolocation={useGeolocation}
                        wasClosed={wasClosedModalChange}
                        selectedCity={selectedCity}
                        onSaveClick={onSaveClick}
                    />
                    <CitySelect
                        visible={visibleModalSelect}
                        onCitySelect={onCitySelect}
                        wasClosed={wasClosedModalSelect}
                    />
                </div>
            )}
        </div>
    );
};

export default CityModal;
