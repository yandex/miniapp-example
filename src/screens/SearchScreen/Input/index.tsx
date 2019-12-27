import React, { ChangeEvent, useCallback, useEffect, useState, useRef } from 'react';

import TextInput from '../../../components/TextInput';

import styles from './styles.module.css';

const SuggestInput: React.FC<{ onChange: (value: string) => void }> = props => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [value, setValue] = useState('');
    const onChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;

            props.onChange(value);
            setValue(value);
        },
        [setValue, props]
    );

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputRef]);

    return (
        <TextInput
            ref={inputRef}
            className={styles.input}
            defaultValue={value}
            placeholder="Поиск по событиям"
            onChange={onChange}
        />
    );
};

export default SuggestInput;
