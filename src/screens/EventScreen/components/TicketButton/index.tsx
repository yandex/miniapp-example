import React, { useCallback, useRef, useState, useEffect, MutableRefObject } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';

import { Ticket } from '../../../../lib/api/fragments/ticket';
import { isIOS } from '../../../../lib/is-ios';

import { Event } from '../../../../redux/slices/event';
import { checkoutEnd, checkoutInProgressSelector, createOrder } from '../../../../redux/slices/order';

import ActionButton from '../../../../components/ActionButton';
import TicketPrice from '../../../../components/TicketPrice';
import { useScreenRef } from '../../../../components/StackNavigator';

import { useScrollEffect } from '../../../../hooks/useScrollEffect';

import CheckoutModal from '../CheckoutModal';

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
    const dispatch = useDispatch();

    const paymentButtonRef = useRef<HTMLDivElement | null>(null);
    const screenRef = useScreenRef();
    const documentRef = useRef(document);
    const scrollableRef: MutableRefObject<EventTarget | null> = isIOS() ? documentRef : screenRef;

    const [stickyVisibleClass, setStickyVisibleClass] = useState<string>('');
    const [screenNode, setScreenNode] = useState(screenRef.current);

    const isCheckoutInProgress = useSelector(checkoutInProgressSelector);

    const onPaymentButtonClick = useCallback(() => {
        dispatch(createOrder(event));
    }, [dispatch, event]);

    const onCheckoutClose = useCallback(() => {
        dispatch(checkoutEnd());
    }, [dispatch]);

    const isStaticPaymentButtonVisible = useScrollEffect(scrollableRef, paymentButtonRef, isElementOutOfViewport);
    const ticket = event.tickets?.[0];

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

    useEffect(() => {
        setScreenNode(screenRef.current);
    }, [screenRef]);

    useEffect(() => {
        // Закрываем форму чекаута при удалении компонента.
        return () => {
            onCheckoutClose();
        };
    }, [onCheckoutClose]);

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
            {screenNode &&
                createPortal(
                    <CheckoutModal
                        event={event}
                        ticket={ticket}
                        visible={isCheckoutInProgress}
                        onClose={onCheckoutClose}
                    />,
                    screenNode
                )}
        </>
    );
};

export default TicketButton;
