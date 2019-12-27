import React, { memo, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MainScreen from './screens/MainScreen';
import EventScreen from './screens/EventScreen';
import RubricScreen from './screens/RubricScreen';
import SelectionScreen from './screens/SelectionScreen';
import SearchScreen from './screens/SearchScreen';

import MenuModal from './components/MenuModal';
import CityModal from './components/CityModal';

import { RootReducer } from './redux';
import { loadCityInfo } from './redux/slices/city';
import { loadUserInfo } from './redux/slices/user';

import { createStackNavigator } from './components/StackNavigator';

const Navigator = createStackNavigator(
    [
        {
            path: '/',
            exact: true,
            component: memo(() => <MainScreen />),
        },
        {
            path: '/event/:id',
            exact: true,
            component: memo(params => <EventScreen id={params.id} />),
        },
        {
            path: '/events/:code',
            exact: true,
            component: memo(params => <RubricScreen code={params.code} />),
        },
        {
            path: '/selection/:code',
            exact: true,
            component: memo(params => <SelectionScreen code={params.code} />),
        },
        {
            path: '/search',
            exact: true,
            component: memo(() => <SearchScreen />),
        },
        {
            path: '*',
            component: memo(() => <div>Страница не найдена</div>),
        },
    ],
    {
        // Сохраняем в истории максимум 10 экранов
        maxDepth: 10,
    }
);

const App: React.FC = () => {
    const dispatch = useDispatch();
    const city = useSelector((state: RootReducer) => state.city.currentCity);

    const [cityModalVisible, setCityModalVisible] = useState<boolean>(false);

    const setCityModalVisibleCallback = useCallback(
        (visible: boolean) => {
            setCityModalVisible(visible);
        },
        [setCityModalVisible]
    );

    useEffect(() => {
        dispatch(loadCityInfo(city.geoid));
    }, [dispatch, city.geoid]);

    useEffect(() => {
        dispatch(loadUserInfo());
    }, [dispatch]);

    useEffect(() => {
        const splashScreen = document.querySelector<HTMLDivElement>('#splash-screen');

        if (splashScreen) {
            // Ждем некоторое время, чтобы заглушка резко не исчезала
            setTimeout(() => splashScreen.parentNode!.removeChild(splashScreen), 400);
        }
    }, []);

    return (
        <>
            <Navigator />

            <MenuModal setCityModalVisibleCallback={setCityModalVisibleCallback} />
            <CityModal setCityModalVisibleCallback={setCityModalVisibleCallback} visible={cityModalVisible} />
        </>
    );
};

export default App;
