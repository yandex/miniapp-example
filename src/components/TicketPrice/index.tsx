import React from 'react';

import { Ticket } from '../../lib/api/fragments/ticket';
import { getCurrencySymbol } from '../../lib/price';

type Props = {
    ticket: Ticket;
};

const space = '\u00A0';

const TicketPrice: React.FC<Props> = ({ ticket }) => {
    if (!ticket.price || !ticket.price.min) {
        return null;
    }

    const text = ['от', (ticket.price.min || 0) / 100, getCurrencySymbol(ticket.price.currency)].join(space);

    return <>{text}</>;
};

export default TicketPrice;
