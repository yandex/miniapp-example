import React, { useCallback } from 'react';

import TextInput from '../../../../../../components/TextInput';

import styles from './styles.module.css';

type Props = {
    className: string;
    label: string;
    type?: string;
    name?: string;
    value: string;
    onChange: (value: string) => void;
    onFocus?: () => void;
    required?: boolean;
};

const CheckoutTextInput: React.FC<Props> = props => {
    const { className, label, type, name, value, onChange, onFocus, required } = props;
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
                name={name}
                value={value}
                onChange={onInputChange}
                onFocus={onFocus}
                required={required}
            />
        </label>
    );
};

export default CheckoutTextInput;
