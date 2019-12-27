import React from 'react';
import { NavLink } from 'react-router-dom';

import { getRubricUrl } from '../../lib/url-builder';

import { MenuTag } from '../../lib/api/fragments/city';

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
    return (
        <ul className={styles.list}>
            <MenuItem to="/" text="Главная" onItemClick={props.onItemClick} />
            {props.tags.map(tag => (
                <MenuItem key={tag.code} to={getRubricUrl(tag.code)} text={tag.name} onItemClick={props.onItemClick} />
            ))}
        </ul>
    );
};

export default MenuList;
