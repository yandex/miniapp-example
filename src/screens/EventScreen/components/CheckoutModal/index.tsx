import React, { useCallback, useRef, TouchEvent, useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useClickAway } from 'react-use';

import { Ticket } from '../../../../lib/api/fragments/ticket';

import { Event } from '../../../../redux/slices/event';
import { buyTicket, paymentInProgressSelector, orderCreationInProgressSelector } from '../../../../redux/slices/order';
import { isAuthenticatedSelector, isAuthorizedSelector, authorize, userSelector } from '../../../../redux/slices/user';

import ActionButton from '../../../../components/ActionButton';

import CheckoutEventInfo from './components/CheckoutEventInfo';
import CheckoutTextInput from './components/CheckoutTextInput';

import styles from './styles.module.css';

type Props = {
    event: Event;
    ticket: Ticket;
    visible: boolean;
    onClose: () => void;
};

const CheckoutModal: React.FC<Props> = ({ event, ticket, visible, onClose }) => {
    const dispatch = useDispatch();

    const contentRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [isAuthorizationRequested, setAuthorizationRequested] = useState(false);

    const isAuthenticated = useSelector(isAuthenticatedSelector);
    const isAuthorized = useSelector(isAuthorizedSelector);
    const userInfo = useSelector(userSelector);
    const isPaymentInProgress = useSelector(paymentInProgressSelector);
    const isOrderCreationInProgress = useSelector(orderCreationInProgressSelector);

    const className = [styles.modal, visible ? styles.visible : styles.hidden].join(' ');

    useClickAway(
        contentRef,
        e => {
            if (!visible) {
                return;
            }

            e.preventDefault();
            onClose();
        },
        ['touchend']
    );

    const onTouchStart = useCallback(
        (e: TouchEvent) => {
            if (!contentRef.current || !visible) {
                return;
            }

            const isInsideModal = contentRef.current.contains(e.target as Element);
            if (!isInsideModal) {
                e.preventDefault();
            }
        },
        [visible, contentRef]
    );

    const onBuyTicket = useCallback(
        (e: FormEvent) => {
            e.preventDefault();

            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }

            dispatch(
                buyTicket(event, {
                    name,
                    phone,
                    email,
                })
            );
        },
        [dispatch, event, name, email, phone]
    );

    const onInputFocus = useCallback(() => {
        if (isAuthenticated && !isAuthorized && !isAuthorizationRequested) {
            setAuthorizationRequested(true);

            dispatch(authorize());
        }
    }, [dispatch, isAuthenticated, isAuthorized, isAuthorizationRequested]);

    useEffect(() => {
        setName(value => value || userInfo.name || '');
        setEmail(value => value || userInfo.email || '');
    }, [userInfo]);

    useEffect(() => {
        if (!visible) {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        }
    }, [visible]);

    let buttonText = 'Перейти к оплате';
    if (!name) {
        buttonText = 'Укажите имя';
    } else if (!phone) {
        buttonText = 'Укажите телефон';
    } else if (!email) {
        buttonText = 'Укажите email';
    } else if (isPaymentInProgress) {
        buttonText = 'Оплата…';
    }

    return (
        <div className={className} onTouchStart={onTouchStart}>
            <div ref={contentRef} className={styles.content}>
                <CheckoutEventInfo className={styles.event} event={event} ticket={ticket} />
                <form ref={formRef} action="" onSubmit={onBuyTicket}>
                    <CheckoutTextInput
                        className={styles.input}
                        label="Имя и фамилия"
                        name="full_name"
                        value={name}
                        onChange={setName}
                        onFocus={onInputFocus}
                        required
                    />
                    <CheckoutTextInput
                        className={styles.input}
                        label="Телефон"
                        type="tel"
                        value={phone}
                        onChange={setPhone}
                        required
                    />
                    <CheckoutTextInput
                        className={styles.input}
                        label="Email адрес"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        onFocus={onInputFocus}
                        required
                    />
                    <ActionButton
                        type="submit"
                        className={styles.button}
                        formInvalid={!formRef.current?.checkValidity()}
                        disabled={isPaymentInProgress || isOrderCreationInProgress}
                    >
                        {buttonText}
                    </ActionButton>
                </form>
            </div>
        </div>
    );
};

export default CheckoutModal;
