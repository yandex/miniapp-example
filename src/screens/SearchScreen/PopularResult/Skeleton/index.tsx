import React from 'react';

import { Text } from '../../../../components/Skeletons';

import styles from './styles.module.css';

type Props = {
    showTitle?: boolean;
};

const PopularResultSkeleton: React.FC<Props> = ({ showTitle }) => (
    <>
        {showTitle && <Text className={styles.title} />}

        <div>
            {Array(15)
                .fill(0)
                .map((_, index) => (
                    <Text className={styles.event} key={index} />
                ))}
        </div>
    </>
);

export default PopularResultSkeleton;
