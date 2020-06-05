import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { getOrdersUrl, getRubricUrl } from '../../lib/url-builder';

import { MenuTag } from '../../lib/api/fragments/city';

import { isAuthenticatedSelector } from '../../redux/slices/user';
import { ordersSelector } from '../../redux/slices/order';

import styles from './style.module.css';

type MenuItemProps = {
    text: string;
    to: string;
    onItemClick: () => void;
};
const MenuItem: React.FC<MenuItemProps> = props => {
    const { text, to, onItemClick } = props;
    return (
        <li className={styles.item}>
            <NavLink
                exact
                onClick={onItemClick}
                className={styles.link}
                activeClassName={styles['active-item']}
                to={to}
            >
                {text}
            </NavLink>
        </li>
    );
};

export type MenuListProps = {
    tags: MenuTag[];
    onItemClick: () => void;
};
const MenuList: React.FC<MenuListProps> = props => {
    const isAuthenticated = useSelector(isAuthenticatedSelector);
    const orders = useSelector(ordersSelector);

    return (
        <ul className={styles.list}>
            {isAuthenticated && (
                <li className={styles.item}>
                    <NavLink
                        exact
                        onClick={props.onItemClick}
                        className={[styles.link, styles['orders-text']].join(' ')}
                        to={getOrdersUrl()}
                    >
                        Мои заказы
                    </NavLink>
                    {orders.length > 0 && <span>{orders.length}</span>}
                </li>
            )}
            <MenuItem
                to="/"
                text="Главная"
                onItemClick={props.onItemClick}
            />
            {props.tags.map(tag => (
                <MenuItem
                    key={tag.code}
                    to={getRubricUrl(tag.code)}
                    text={tag.name}
                    onItemClick={props.onItemClick}
                />
            ))}
        </ul>
    );
};

export default MenuList;
