import React from 'react';

import styles from './styles.module.css';

const Title: React.FC = ({ children }) => {
    return <h2 className={styles.title}>{children}</h2>;
};

export default Title;
