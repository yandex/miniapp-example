import React, { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

import styles from './styles.module.css';

export type Props = {
    type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
    className?: string;
    disabled?: boolean;
    formInvalid?: boolean;
    onClick?: () => void;
    children: ReactNode;
};
const ActionButton = forwardRef<HTMLButtonElement, Props>(
    ({ type, className, disabled, formInvalid, children, onClick }, ref) => {
        const cls = [styles.action, className, formInvalid && styles.invalid].filter(Boolean).join(' ');
        return (
            <button ref={ref} type={type} className={cls} onClick={onClick} disabled={disabled}>
                {children}
            </button>
        );
    }
);

export default ActionButton;
