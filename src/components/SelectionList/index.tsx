import React from 'react';
import { Link } from 'react-router-dom';

import { getSelectionUrl } from '../../lib/url-builder';
import { Selection } from '../../redux/slices/selections';
import Image from '../Image';

import styles from './style.module.css';

export type Props = {
    items: Array<Selection | null>;
};

const SelectionList: React.FC<Props> = ({ items }) => {
    return (
        <div className={styles.block}>
            {items.map(selection => {
                if (!selection) {
                    return null;
                }

                return (
                    <Link to={getSelectionUrl(selection.code)} className={styles.item} key={selection.code}>
                        <Image
                            className={styles.image}
                            src={selection.image && selection.image.selectionCard}
                            bgColor={selection.image && selection.image.bgColor}
                            alt={selection.title}
                        />
                        <div className={styles.info}>
                            <div className={styles.title}>{selection.title}</div>
                            <div className={styles.counter}>{selection.count} событий</div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default SelectionList;
