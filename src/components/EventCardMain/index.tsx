import React, { memo } from 'react';
import { Link } from 'react-router-dom';

import { getEventUrl } from '../../lib/url-builder';
import { ActualEvent } from '../../lib/api/fragments/actual-event';

import Image from '../Image';
import PriceLabel from '../PriceLabel';

import styles from './style.module.css';

export type Props = {
    event: ActualEvent;
};

const EventCardMain: React.FC<Props> = props => {
    const { preview } = props.event.scheduleInfo;
    const { id, title, type, image, tickets } = props.event.eventPreview;
    const ticket = tickets && tickets[0];

    const bgColor = (image && image.bgColor) || '#555';
    const singleDate = preview && preview.singleDate;

    return (
        <Link to={getEventUrl(id)} className={styles.card}>
            <div className={styles['info-block']} style={{ backgroundColor: bgColor }}>
                {singleDate && (
                    <div className={styles.date}>
                        <div className={styles.day}>{singleDate.day}</div>
                        <div className={styles.month}>{singleDate.month}</div>
                    </div>
                )}

                <div className={styles.description}>
                    <div className={styles.annotation}>{type.name}</div>
                    <div className={styles.title}>{title}</div>
                </div>
            </div>
            <div className={styles['image-wrapper']}>
                {image && image.actualListCard ? (
                    <Image
                        className={styles.image}
                        alt={title}
                        src={image.actualListCard}
                        src2x={image.actualListCard2x}
                        bgColor={image.bgColor}
                    />
                ) : (
                    <div className={styles.preview} />
                )}
                {ticket && <PriceLabel ticket={ticket} position={'right'} />}
                {image && <div className={styles['image-overlay']} />}
            </div>
        </Link>
    );
};

export default memo(EventCardMain);
