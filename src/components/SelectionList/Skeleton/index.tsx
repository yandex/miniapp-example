import React from 'react';

import { Rect } from '../../Skeletons';

import styles from './styles.module.css';

const SelectionListSkeleton: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={[styles.block, className].filter(Boolean).join(' ')}>
            {Array(5)
                .fill(0)
                .map((_, index) => (
                    <Rect key={index} className={styles.item} />
                ))}
        </div>
    );
};

export default SelectionListSkeleton;
