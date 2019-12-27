import React, { useMemo } from 'react';
import { Map as YMap, Placemark, YMaps } from 'react-yandex-maps';

type Props = {
    point: [number, number];
};

const Map: React.FC<Props> = ({ point }) => {
    const mapData = useMemo(() => ({ center: point, zoom: 15 }), [point]);

    return (
        <YMaps>
            <YMap width={'100%'} height={'100%'} defaultState={mapData}>
                <Placemark geometry={point} />
            </YMap>
        </YMaps>
    );
};

export default Map;
