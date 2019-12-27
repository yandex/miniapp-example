import React from 'react';

import styles from './styles.module.css';

export type ContentProps = {
    className?: string;
};

const Content: React.FC<ContentProps> = props => {
    return <div className={[props.className, styles.content].filter(Boolean).join(' ')}>{props.children}</div>;
};

export default Content;
