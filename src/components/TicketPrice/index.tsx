import React from 'react';

import { Ticket } from '../../lib/api/fragments/ticket';
import { getCurrencySymbol } from '../../lib/price';

type Props = {
    ticket: Ticket;
    exact?: boolean;
};

const space = '\u00A0';

const TicketPrice: React.FC<Props> = ({ ticket, exact }) => {
    if (!ticket.price || !ticket.price.min) {
        return null;
    }

    const text = [
        exact ? '' : `от${space}`,
        (ticket.price.min || 0) / 100,
        space,
        getCurrencySymbol(ticket.price.currency),
    ].join('');

    return <>{text}</>;
};

export default TicketPrice;
