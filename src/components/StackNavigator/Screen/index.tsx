import React from 'react';

import styles from './styles.module.css';

type Props = {
    isVisible: boolean;
};

const Screen: React.FC<Props> = ({ isVisible, children }) => {
    return <div className={[styles.screen, !isVisible && styles.hidden].filter(Boolean).join(' ')}>{children}</div>;
};

export default Screen;
