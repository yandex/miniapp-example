import React from 'react';
import { useSelector } from 'react-redux';

import { OrderResponse, PaymentStatus } from '../../../lib/api/types';
import { getCurrencySymbol } from '../../../lib/price';

import { EventPage, eventPageSelector } from '../../../redux/slices/event';

import Image from '../../../components/Image';

import styles from './styles.module.css';

const StatusMap = {
    [PaymentStatus.New]: 'Не оплачен',
    [PaymentStatus.InModeration]: 'Идёт оплата',
    [PaymentStatus.Held]: 'Идёт оплата',
    [PaymentStatus.InProgress]: 'Идёт оплата',
    [PaymentStatus.ModerationNegative]: 'Отклонён',
    [PaymentStatus.InCancel]: 'Отменён',
    [PaymentStatus.Canceled]: 'Отменён',
    [PaymentStatus.Rejected]: 'Отклонён',
    [PaymentStatus.Paid]: 'Оплачен',
};

type Props = {
    order: OrderResponse
}

const Order: React.FC<Props> = ({ order }) => {
    const eventPage: Partial<EventPage> = useSelector(eventPageSelector(order.event.id));
    const { event, schedule } = eventPage;
    const ticket = event?.tickets?.[0];
    const image = event?.images?.[0];
    const currency = ticket?.price?.currency ?? 'rub';

    const status = order.apiResponseStatus === 'fail' ? 'Ошибка' : StatusMap[order.status];

    return (
        <div className={styles.wrapper}>
            <div className={styles['logo-container']}>
                <Image
                    className={styles.logo}
                    src={image?.thumbnail}
                    src2x={image?.thumbnail2x}
                />
            </div>
            <div className={styles.content}>
                <div className={styles.info}>
                    <p className={styles.title}>{order.event.title}</p>
                    <div className={styles.schedule}>
                        <p className={styles.date}>Сегодня в 20:00</p>
                        <p className={styles.location}>{schedule?.oneOfPlaces?.title}</p>
                    </div>
                </div>
                <div className={styles['status-container']}>
                    <p className={styles.cost}>{order.cost}&nbsp;{getCurrencySymbol(currency)}</p>
                    <p className={styles.status}>{status}</p>
                </div>
            </div>
        </div>
    );
};

export default Order;
