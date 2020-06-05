import React, { useCallback } from 'react';

import TextInput from '../../../../../../components/TextInput';

import styles from './styles.module.css';

type Props = {
    className: string;
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    onFocus?: () => void;
    required?: boolean;
};

const CheckoutTextInput: React.FC<Props> = ({ className, label, type, value, onChange, onFocus, required }) => {
    const onInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);
        },
        [onChange]
    );

    return (
        <label className={[styles.container, className].join(' ')}>
            <div className={styles.label}>{label}</div>
            <TextInput
                className={styles.input}
                type={type}
                value={value}
                onChange={onInputChange}
                onFocus={onFocus}
                required={required}
            />
        </label>
    );
};

export default CheckoutTextInput;
