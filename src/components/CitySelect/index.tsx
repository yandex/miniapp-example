import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootReducer } from '../../redux';
import { loadCityList } from '../../redux/slices/city-list';

import { City } from '../CityModal';
import TextInput from '../TextInput';

import styles from './styles.module.css';

type CitySelectProps = {
    visible: boolean;
    wasClosed: boolean;
    onCitySelect: (city: City) => void;
};

type CitySelectContentProps = {
    isLoading: boolean;
    items: City[];
    onCityClick: CitySelectProps['onCitySelect'];
};

type CityOptionProps = {
    city: City;
    onCityClick: CitySelectContentProps['onCityClick'];
};

const CityOption: React.FC<CityOptionProps> = props => {
    const { city, onCityClick } = props;

    const onCitySelectHandler = useCallback(() => {
        onCityClick(city);
    }, [onCityClick, city]);

    return (
        <li className={styles['city-item']} onClick={onCitySelectHandler}>
            {city.name}
        </li>
    );
};

const CitySelectContent: React.FC<CitySelectContentProps> = props => {
    const { isLoading, items, onCityClick } = props;

    if (isLoading) {
        return <>loading...</>;
    }

    return (
        <ul className={styles['city-list']}>
            {items.map(city => {
                if (!city) {
                    return null;
                }

                return <CityOption key={city.geoid} city={city} onCityClick={onCityClick} />;
            })}
        </ul>
    );
};

const CitySelect: React.FC<CitySelectProps> = ({ visible, onCitySelect, wasClosed }) => {
    const dispatch = useDispatch();
    const { items, isLoading } = useSelector((state: RootReducer) => state.cityList);
    const [suggestedItems, setItems] = useState(items);

    const className = [
        styles.wrapper,
        visible || wasClosed ? styles[`wrapper-visible_${visible ? 'yes' : 'no'}`] : '',
    ].join(' ');

    useEffect(() => {
        if (!items.length) {
            dispatch(loadCityList());
        } else {
            setItems(items);
        }
    }, [dispatch, items]);

    const onSuggestChangeHandler = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value.toLowerCase();

            if (!value.trim()) {
                setItems(items);
            } else {
                setItems(items.filter(({ name }) => name.toLowerCase().indexOf(value) !== -1));
            }
        },
        [items]
    );

    return (
        <div className={className}>
            <TextInput className={styles.input} placeholder="Введите название" onChange={onSuggestChangeHandler} />
            <CitySelectContent isLoading={isLoading} items={suggestedItems} onCityClick={onCitySelect} />
        </div>
    );
};

export default CitySelect;
