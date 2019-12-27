import React, { useCallback, useState } from 'react';

import { Coordinates } from '../../lib/api/fragments/coordinates';
import { Metro } from '../../lib/api/fragments/metro';

import { getStaticMapUrl } from '../../lib/maps';

import YaMapModal from '../YaMapModal';
import Image from '../Image';

import styles from './styles.module.css';

type Props = {
    coordinates: Coordinates;
    metro: Metro[] | null;
    address: string | null;
};

const YaMapWidget: React.FC<Props> = props => {
    const staticMapImage = {
        url: getStaticMapUrl({
            size: [650, 176],
            z: 16,
            pt: [props.coordinates.longitude, props.coordinates.latitude, 'pm2rdl'],
        }),
        width: 650,
        height: 176,
    };

    const [isModalOpen, setModalOpen] = useState(false);

    const onMapClick = useCallback(() => {
        setModalOpen(true);

        document.body.style.overflow = 'hidden';
    }, []);

    const onBackClick = useCallback(() => {
        setModalOpen(false);

        document.body.style.overflow = 'auto';
    }, []);

    return (
        <>
            <div onClick={onMapClick}>
                <Image className={styles.map} src={staticMapImage} />
            </div>
            {isModalOpen && <YaMapModal {...props} onBackClick={onBackClick} />}
        </>
    );
};

export default YaMapWidget;
