import React from 'react';

import styles from './styles.module.css';

const RubricTitle: React.FC = ({ children }) => {
    return <h2 className={styles.title}>{children}</h2>;
};

export default RubricTitle;
