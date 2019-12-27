import React from 'react';

import { Ticket } from '../../lib/api/fragments/ticket';
import TicketPrice from '../TicketPrice';

import styles from './styles.module.css';

type Props = {
    ticket: Ticket;
    position?: 'left' | 'right';
};

const PriceLabel: React.FC<Props> = props => (
    <div className={[styles.price, styles[props.position || 'left']].join(' ')}>
        <TicketPrice ticket={props.ticket} />
    </div>
);

export default PriceLabel;
