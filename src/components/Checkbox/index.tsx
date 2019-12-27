import React from 'react';

import styles from './styles.module.css';

export type Props = JSX.IntrinsicElements['input'] & {
    label?: string;
};
const Checkbox: React.FC<Props> = ({ className, label, ...props }) => {
    const cls = [styles.checkbox, className].filter(Boolean).join(' ');

    return (
        <label className={styles.label}>
            <input type="checkbox" className={cls} {...props} />
            {label}
        </label>
    );
};

export default Checkbox;
