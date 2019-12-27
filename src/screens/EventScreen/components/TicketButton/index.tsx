import React, { useCallback, useRef, useState, useEffect } from 'react';

import { Ticket } from '../../../../lib/api/fragments/ticket';
import { Event } from '../../../../redux/slices/event';

import { getNativePayment } from '../../../../lib/payment';
import { useVisible } from '../../../../hooks/useVisible';

import ActionButton from '../../../../components/ActionButton';
import TicketPrice from '../../../../components/TicketPrice';

import styles from './styles.module.css';

const PAGE_HEADER_HEIGHT = 56;
const intersectionObserverOptions = {
    rootMargin: `-${PAGE_HEADER_HEIGHT}px 0px 0px 0px`,
};

const StickyVisibleClasses = {
    Yes: styles['sticky-visible_yes'],
    No: styles['sticky-visible_no'],
};

type ButtonProps = {
    ticket: Ticket;
    onClick: () => void;
};
const Button: React.FC<ButtonProps> = ({ ticket, onClick }) => (
    <ActionButton className={styles.button} onClick={onClick}>
        Билеты <TicketPrice ticket={ticket} />
    </ActionButton>
);

type Props = {
    event: Partial<Event>;
};
const TicketButton: React.FC<Props> = ({ event }) => {
    const ticket = event.tickets && event.tickets[0];

    const paymentButtonRef = useRef<HTMLDivElement | null>(null);
    const [stickyVisibleClass, setStickyVisibleClass] = useState<string>('');
    const onPaymentButtonClick = useCallback(() => {
        getNativePayment();
    }, []);

    const isStaticPaymentButtonVisible = useVisible(paymentButtonRef, intersectionObserverOptions);
    useEffect(() => {
        if (!paymentButtonRef.current || !ticket || isStaticPaymentButtonVisible === undefined) {
            return;
        }

        if (isStaticPaymentButtonVisible && stickyVisibleClass !== StickyVisibleClasses.Yes) {
            return;
        }

        const stickyButtonVisibleClass = isStaticPaymentButtonVisible ?
            StickyVisibleClasses.No :
            StickyVisibleClasses.Yes;

        setStickyVisibleClass(stickyButtonVisibleClass);
    }, [paymentButtonRef, isStaticPaymentButtonVisible, ticket, stickyVisibleClass]);

    if (!ticket) {
        return null;
    }

    return (
        <>
            <div className={styles.static} ref={paymentButtonRef}>
                <Button ticket={ticket} onClick={onPaymentButtonClick} />
            </div>
            <div className={[styles.sticky, stickyVisibleClass].join(' ')}>
                <Button ticket={ticket} onClick={onPaymentButtonClick} />
            </div>
        </>
    );
};

export default TicketButton;
