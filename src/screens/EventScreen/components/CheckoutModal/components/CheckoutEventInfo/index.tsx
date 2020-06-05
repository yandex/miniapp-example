import React from 'react';

import { Ticket } from '../../../../../../lib/api/fragments/ticket';
import { Event } from '../../../../../../redux/slices/event';

import Image from '../../../../../../components/Image';
import TicketPrice from '../../../../../../components/TicketPrice';

import styles from './styles.module.css';

type Props = {
    className: string;
    event: Event;
    ticket: Ticket;
};

const CheckoutEventInfo: React.FC<Props> = ({ className, event, ticket }) => {
    const { title, image } = event;

    return (
        <div className={[styles.container, className].join(' ')}>
            {image && image.touchPrimary ? (
                <Image className={styles.image} alt={title} src={image.touchPrimary} bgColor={image.bgColor} />
            ) : (
                <div className={styles.preview} />
            )}
            <div className={styles.title}>{title}</div>
            <div className={styles.price}>
                <TicketPrice ticket={ticket} exact />
            </div>
        </div>
    );
};

export default CheckoutEventInfo;
