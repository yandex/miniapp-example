import React from 'react';

import styles from './styles.module.css';

export type Props = {
    className?: string;
    onClick: () => void;
};
const ClearButton: React.FC<Props> = ({ className, children, onClick }) => {
    const cls = [styles.clear, className].filter(Boolean).join(' ');
    return (
        <button className={cls} onClick={onClick}>
            {children}
        </button>
    );
};

export default ClearButton;
