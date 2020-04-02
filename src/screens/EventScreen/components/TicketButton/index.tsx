import React, { useCallback, useRef, useState, useEffect, MutableRefObject } from 'react';

import { Ticket } from '../../../../lib/api/fragments/ticket';
import { Event } from '../../../../redux/slices/event';

import { getNativePayment } from '../../../../lib/payment';

import ActionButton from '../../../../components/ActionButton';
import TicketPrice from '../../../../components/TicketPrice';

import { useScreenRef } from '../../../../components/StackNavigator';
import { useScrollEffect } from '../../../../hooks/useScrollEffect';
import { isIOS } from '../../../../lib/is-ios';
import styles from './styles.module.css';

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

const isElementOutOfViewport = (ref: React.MutableRefObject<HTMLDivElement | null>) =>
    Number(ref.current?.getBoundingClientRect()?.top) < 0;

type Props = {
    event: Partial<Event>;
};
const TicketButton: React.FC<Props> = ({ event }) => {
    const ticket = event.tickets && event.tickets[0];

    const paymentButtonRef = useRef<HTMLDivElement | null>(null);
    const screenRef = useScreenRef();
    const documentRef = useRef(document);
    const scrollableRef: MutableRefObject<EventTarget | null> = isIOS() ? documentRef : screenRef;
    const [stickyVisibleClass, setStickyVisibleClass] = useState<string>('');
    const onPaymentButtonClick = useCallback(() => {
        getNativePayment();
    }, []);

    const isStaticPaymentButtonVisible = useScrollEffect(scrollableRef, paymentButtonRef, isElementOutOfViewport);
    useEffect(() => {
        if (!paymentButtonRef.current || !ticket) {
            return;
        }

        if (!isStaticPaymentButtonVisible && stickyVisibleClass !== StickyVisibleClasses.Yes) {
            return;
        }

        const stickyButtonVisibleClass = isStaticPaymentButtonVisible ?
            StickyVisibleClasses.Yes :
            StickyVisibleClasses.No;

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
