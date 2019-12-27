import React from 'react';

import YaMapWidget from '../../../../components/YaMapWidget';
import { ScheduleInfo } from '../../../../redux/slices/event';

import styles from './styles.module.css';

type Props = {
    schedule: Partial<ScheduleInfo>;
};

const VenueInfo: React.FC<Props> = ({ schedule }) => {
    const { oneOfPlaces, placePreview } = schedule;

    if (!oneOfPlaces || !oneOfPlaces.coordinates) {
        return <div className={styles.title}>{placePreview}</div>;
    }

    return (
        <>
            <YaMapWidget
                coordinates={oneOfPlaces.coordinates}
                metro={oneOfPlaces.metro}
                address={oneOfPlaces.address}
            />
            <div className={styles.title}>{oneOfPlaces.title}</div>
            <div className={styles.address}>{oneOfPlaces.address}</div>
        </>
    );
};

export default VenueInfo;
