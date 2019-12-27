import React from 'react';

import styles from './styles.module.css';

export type Props = {
    className?: string;
    onClick: () => void;
};
const ActionButton: React.FC<Props> = ({ className, children, onClick }) => {
    const cls = [styles.action, className].filter(Boolean).join(' ');
    return (
        <button className={cls} onClick={onClick}>
            {children}
        </button>
    );
};

export default ActionButton;
