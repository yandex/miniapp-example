import React, { useCallback, useRef, useState, useEffect, MutableRefObject } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Ticket } from '../../../../lib/api/fragments/ticket';
import { RootReducer } from '../../../../redux';
import { Event } from '../../../../redux/slices/event';

import ActionButton from '../../../../components/ActionButton';
import TicketPrice from '../../../../components/TicketPrice';

import { useScreenRef } from '../../../../components/StackNavigator';
import { useScrollEffect } from '../../../../hooks/useScrollEffect';
import { isIOS } from '../../../../lib/is-ios';
import { buyTicket } from '../../../../redux/slices/order';
import styles from './styles.module.css';

const StickyVisibleClasses = {
    Yes: styles['sticky-visible_yes'],
    No: styles['sticky-visible_no'],
};

type ButtonProps = {
    ticket: Ticket;
    disabled?: boolean;
    onClick: () => void;
};
const Button: React.FC<ButtonProps> = ({ ticket, disabled, onClick }) => (
    <ActionButton className={styles.button} disabled={disabled} onClick={onClick}>
        Билеты <TicketPrice ticket={ticket} />
    </ActionButton>
);

const isElementOutOfViewport = (ref: React.MutableRefObject<HTMLDivElement | null>) =>
    Number(ref.current?.getBoundingClientRect()?.top) < 0;

type Props = {
    event: Event;
};
const TicketButton: React.FC<Props> = ({ event }) => {
    const ticket = event.tickets && event.tickets[0];

    const paymentButtonRef = useRef<HTMLDivElement | null>(null);
    const dispatch = useDispatch();
    const isLoading = useSelector((state: RootReducer) => state.order.ui.isLoading);
    const screenRef = useScreenRef();
    const documentRef = useRef(document);
    const scrollableRef: MutableRefObject<EventTarget | null> = isIOS() ? documentRef : screenRef;
    const [stickyVisibleClass, setStickyVisibleClass] = useState<string>('');
    const onPaymentButtonClick = useCallback(() => {
        dispatch(buyTicket(event));
    }, [dispatch, event]);

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
                <Button ticket={ticket} disabled={isLoading} onClick={onPaymentButtonClick} />
            </div>
            <div className={[styles.sticky, stickyVisibleClass].join(' ')}>
                <Button ticket={ticket} disabled={isLoading} onClick={onPaymentButtonClick} />
            </div>
        </>
    );
};

export default TicketButton;
