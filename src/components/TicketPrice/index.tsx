import React from 'react';

import { Currency, Ticket } from '../../lib/api/fragments/ticket';

type Props = {
    ticket: Ticket;
};

const currencySymbol: { [key in Currency]: string } = {
    rub: '₽',
    usd: '$',
};

const space = '\u00A0';

const TicketPrice: React.FC<Props> = ({ ticket }) => {
    if (!ticket.price || !ticket.price.min) {
        return null;
    }

    const text = ['от', (ticket.price.min || 0) / 100, currencySymbol[ticket.price.currency]].join(space);

    return <>{text}</>;
};

export default TicketPrice;
