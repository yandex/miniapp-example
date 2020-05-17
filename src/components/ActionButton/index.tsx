import React from 'react';

import styles from './styles.module.css';

export type Props = {
    className?: string;
    disabled?: boolean
    onClick: () => void;
};
const ActionButton: React.FC<Props> = ({ className, disabled, children, onClick }) => {
    const cls = [styles.action, className, disabled && styles.disabled].filter(Boolean).join(' ');
    return (
        <button className={cls} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
};

export default ActionButton;
