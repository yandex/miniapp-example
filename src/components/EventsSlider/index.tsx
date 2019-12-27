import React from 'react';

import { ActualEvent } from '../../lib/api/fragments/actual-event';

import styles from './style.module.css';

export type Props = {
    items: Array<ActualEvent | null>;
    component: React.FC<{
        event: ActualEvent;
        onClick?: () => void;
        className?: string;
    }>;
};

const EventsSlider: React.FC<Props> = ({ items, component: Card }) => {
    return (
        <div className={styles.list}>
            {items.map(actualEvent => {
                if (!actualEvent) {
                    return null;
                }

                return <Card className={styles.item} key={actualEvent.eventPreview.id} event={actualEvent} />;
            })}
        </div>
    );
};

export default EventsSlider;
