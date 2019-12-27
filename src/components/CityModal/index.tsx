import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useClickAway } from 'react-use';

import { RootReducer } from '../../redux';
import { setCity as saveCity } from '../../redux/slices/city';
import { CityListState } from '../../redux/slices/city-list';

import CityChange from '../CityChange';
import CitySelect from '../CitySelect';

import { getCurrentCity } from '../../lib/geolocation';

import styles from './styles.module.css';

export type City = CityListState['items'][0];

const CityModal: React.FC<{
    visible: boolean;
    setCityModalVisibleCallback: (visible: boolean) => void;
}> = ({ visible: isModalVisible, setCityModalVisibleCallback: setModalVisible }) => {
    const contentRef = React.createRef<HTMLDivElement>();
    const dispatch = useDispatch();
    const history = useHistory();

    const savedCity = useSelector((state: RootReducer) => state.city.currentCity);

    const [selectedCity, selectCity] = useState<RootReducer['city']['currentCity']>(savedCity);
    const [currentCity, setCurrentCity] = useState<RootReducer['city']['currentCity'] | null>(null);
    const [useGeolocation, setGeolocation] = useState<boolean>(true);

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
        getCurrentCity().then(city => setCurrentCity(city));
    }, []);

    useEffect(() => {
        setGeolocation(selectedCity.geoid === (currentCity && currentCity.geoid));
    }, [currentCity, selectedCity]);

    useEffect(() => {
        setVisibleModalChange(isModalVisible);
    }, [isModalVisible, setVisibleModalChange]);

    useEffect(() => {
        if (useGeolocation && currentCity) {
            selectCity(currentCity);
        }
    }, [currentCity, useGeolocation, selectCity]);

    const onGeolocationChanged = useCallback(e => {
        const isChecked = e.target.checked;

        setGeolocation(isChecked);
    }, []);

    const onClose = useCallback(() => {
        if (selectedCity.name !== savedCity.name) {
            selectCity(savedCity);
        }

        setWasClosed(true);
        setVisibleModalSelect(false);
        setVisibleModalChange(false);
        setModalVisible(false);
    }, [
        selectCity,
        setWasClosed,
        selectedCity,
        savedCity,
        setVisibleModalSelect,
        setVisibleModalChange,
        setModalVisible,
    ]);

    const onSaveClick = useCallback(() => {
        setWasClosed(true);
        setVisibleModalChange(false);
        setModalVisible(false);

        dispatch(saveCity(selectedCity));

        if (selectedCity.name !== savedCity.name) {
            history.push('/');
        }
    }, [selectedCity, savedCity.name, dispatch, history, setModalVisible]);

    const onCitySelect = useCallback(
        (city: City) => {
            selectCity(city);
            setWasClosedModalSelect(true);
            setVisibleModalSelect(false);
            setVisibleModalChange(true);
        },
        [selectCity, setWasClosedModalSelect, setVisibleModalSelect, setVisibleModalChange]
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
