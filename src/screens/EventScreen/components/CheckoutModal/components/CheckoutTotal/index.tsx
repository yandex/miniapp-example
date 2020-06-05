import React from 'react';

import { Ticket } from '../../../../../../lib/api/fragments/ticket';
import { MediaImageSize } from '../../../../../../lib/api/fragments/image-size';

import Image from '../../../../../../components/Image';
import TicketPrice from '../../../../../../components/TicketPrice';

import styles from './styles.module.css';

type Props = {
    className: string;
    ticket: Ticket;
};

const logo: MediaImageSize = {
    url: `${process.env.PUBLIC_URL}/logo192.png`,
    width: 192,
    height: 192,
};

const serviceName = 'MiniApp Example';

const CheckoutTotal: React.FC<Props> = ({ className, ticket }) => {
    return (
        <div className={[styles.container, className].join(' ')}>
            <Image className={styles.image} src={logo} alt={serviceName} />
            <div className={styles.serviceName}>{serviceName}</div>
            <div className={styles.price}>
                <TicketPrice ticket={ticket} exact />
            </div>
        </div>
    );
};

export default CheckoutTotal;
