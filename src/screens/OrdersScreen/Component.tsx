import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';

import { useMetrikaHit } from '../../hooks/useMetrikaHit';

import {
    ordersLoadingSelector,
    ordersSelector
} from '../../redux/slices/order';

import Order from './Order';

import styles from './styles.module.css';

type Props = {
    skeleton: ReactElement
};

const Component: React.FC<Props> = ({ skeleton }) => {
    const orders = useSelector(ordersSelector);
    const isLoading = useSelector(ordersLoadingSelector);

    useMetrikaHit();

    if (isLoading) {
        return skeleton;
    }

    return (
        <div className={styles.content}>
            {orders.length > 0 ? orders.map(order => <Order key={order.id} order={order} />) : (
                <div className={styles.empty}>
                    <p className={styles.text}>Вы пока не покупали билеты</p>
                </div>
            )}
        </div>
    );
};

export default Component;
