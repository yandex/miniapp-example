import React, { memo, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { isIOS } from './lib/is-ios';
import { useWatchAuth } from './hooks/useWatchAuth';
import { loadCityInfo } from './redux/slices/city';

import MainScreen from './screens/MainScreen';
import EventScreen from './screens/EventScreen';
import RubricScreen from './screens/RubricScreen';
import SelectionScreen from './screens/SelectionScreen';
import SearchScreen from './screens/SearchScreen';
import OrdersScreen from './screens/OrdersScreen';

import MenuModal from './components/MenuModal';
import CityModal from './components/CityModal';

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
            component: memo(({ params: { id } }) => <EventScreen id={id} />),
        },
        {
            path: '/events/:code',
            exact: true,
            component: memo(({ params: { code } }) => <RubricScreen code={code} />),
        },
        {
            path: '/selection/:code',
            exact: true,
            component: memo(({ params: { code } }) => <SelectionScreen code={code} />),
        },
        {
            path: '/search',
            exact: true,
            component: memo(() => <SearchScreen />),
        },
        {
            path: '/orders',
            exact: true,
            component: memo(() => <OrdersScreen />),
        },
        {
            path: '*',
            component: memo(() => <div>Страница не найдена</div>),
        },
    ],
    {
        // Сохраняем в истории максимум 10 экранов
        maxDepth: 10,
        transitions: true,
    }
);

const App: React.FC = () => {
    const dispatch = useDispatch();

    const [cityModalVisible, setCityModalVisible] = useState<boolean>(false);

    const setCityModalVisibleCallback = useCallback(
        (visible: boolean) => {
            setCityModalVisible(visible);
        },
        [setCityModalVisible]
    );

    useEffect(() => {
        dispatch(loadCityInfo());
    }, [dispatch]);

    useEffect(() => {
        if (isIOS()) {
            document.body.style.overflow = 'auto';
        }
    }, []);

    useWatchAuth();

    return (
        <>
            <Navigator />
            <MenuModal setCityModalVisibleCallback={setCityModalVisibleCallback} />
            <CityModal setCityModalVisibleCallback={setCityModalVisibleCallback} visible={cityModalVisible} />
        </>
    );
};

export default App;
