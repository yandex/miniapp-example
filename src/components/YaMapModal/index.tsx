import React, { Suspense, MouseEvent, useMemo, lazy } from 'react';

import { Coordinates } from '../../lib/api/fragments/coordinates';
import { Metro } from '../../lib/api/fragments/metro';

import styles from './styles.module.css';

const Map = lazy(() =>
    import(
        /* webpackChunkName: "ya-map-modal" */
        './Map'
    )
);

type Props = {
    onBackClick: (e: MouseEvent<HTMLButtonElement>) => void;
    coordinates: Coordinates;
    address: string | null;
    metro: Metro[] | null;
};

const MetroStation: React.FC<Metro> = props => {
    return (
        <div className={styles.station}>
            {props.colors.map(color => {
                return <div style={{ backgroundColor: color }} key={color} className={styles['metro-point']} />;
            })}
            {props.name}
        </div>
    );
};

const YaMapModal: React.FC<Props> = props => {
    const { coordinates, metro, address } = props;
    const place = useMemo<[number, number]>(() => [coordinates.longitude, coordinates.latitude], [coordinates]);

    return (
        <div className={styles.modal}>
            <div className={styles.close}>
                <button className={styles['close-button']} onClick={props.onBackClick}>
                    Назад
                </button>
            </div>
            <Suspense fallback={null}>
                <Map point={place} />
            </Suspense>
            {(metro || address) && (
                <div className={styles['metro-containter']}>
                    {metro && metro.map(station => <MetroStation key={station.name} {...station} />)}
                    {address}
                </div>
            )}
        </div>
    );
};

export default YaMapModal;
