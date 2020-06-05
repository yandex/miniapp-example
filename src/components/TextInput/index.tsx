import React, { forwardRef } from 'react';

import styles from './styles.module.css';

type Props = JSX.IntrinsicElements['input'];
const TextInput = forwardRef<HTMLInputElement, Props>(({ className, type, ...props }, ref) => {
    const cls = [styles.input, className].filter(Boolean).join(' ');

    return <input ref={ref} type={type || 'text'} className={cls} {...props} />;
});

export default TextInput;
