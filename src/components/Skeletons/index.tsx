import React from 'react';

import styles from './styles.module.css';

type RectProps = {
    className?: string;
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
};

export const Rect: React.FC<RectProps> = ({ className, width, height }) => {
    return <div className={mix(styles.rect, className)} style={{ width, height }} />;
};

type TextProps = {
    className?: string;
    width?: number | string;
    size?: number;
};

export const Text: React.FC<TextProps> = ({ className, width, size }) => {
    return <div className={mix(styles.text, className)} style={{ width, height: size }} />;
};

function mix(...classNames: Array<string | null | undefined>) {
    return classNames.filter(Boolean).join(' ');
}
