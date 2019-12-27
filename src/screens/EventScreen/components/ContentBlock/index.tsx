import React from 'react';

import styles from './styles.module.css';

const ContentBlock: React.FC<{ className?: string }> = ({ children, className }) => {
    return <div className={[styles.block, className].filter(Boolean).join(' ')}>{children}</div>;
};

export default ContentBlock;
