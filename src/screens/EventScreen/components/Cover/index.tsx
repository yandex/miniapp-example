import React from 'react';

import { Event } from '../../../../redux/slices/event';

import Image from '../../../../components/Image';

import styles from './styles.module.css';

type Props = {
    event: Partial<Event>;
    imageRef: React.Ref<HTMLDivElement>;
};

const Cover: React.FC<Props> = ({ event, imageRef }) => {
    const { title, argument, image, tags, contentRating } = event;

    const tagLine = [...(tags || []).map(tag => tag.name), contentRating].filter(Boolean).join('  •  ');

    return (
        <div className={styles.cover} ref={imageRef}>
            {image && <Image className={styles.image} src={image.touchPrimary} bgColor={image.bgColor} />}
            <div className={styles.fade} />
            <div className={styles.overview}>
                <h1 className={styles.title}>{title}</h1>
                <div className={styles.argument}>{argument}</div>
                <div className={styles.tags}>{tagLine}</div>
            </div>
        </div>
    );
};

export default Cover;
