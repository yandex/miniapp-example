import React, { useCallback, useState, MouseEvent, useMemo } from 'react';

import { GalleryImage } from '../../lib/api/fragments/gallery-image';

import GalleryModal from '../GalleryModal';
import Image from '../Image';

import styles from './styles.module.css';

type Props = {
    items: Array<GalleryImage | null>;
};

const Gallery: React.FC<Props> = props => {
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const images = useMemo(() => {
        return props.items.filter(Boolean);
    }, [props.items]) as GalleryImage[];

    const onItemClick = useCallback((e: MouseEvent<HTMLImageElement>) => {
        const el = e.currentTarget;
        const index = Array.prototype.indexOf.call(el.parentElement!.children, el);
        setSelectedIndex(index);
    }, []);

    const onBackClick = useCallback(() => {
        setSelectedIndex(-1);
    }, []);

    return (
        <>
            <div className={styles.container}>
                {images.map((image, i) => {
                    return (
                        <div className={styles.thumbnail} key={image.thumbnail2x.url} onClick={onItemClick}>
                            <Image
                                className={styles.image}
                                src={image.thumbnail}
                                src2x={image.thumbnail2x}
                                bgColor={image.bgColor}
                                alt={`Фотография ${i + 1}`}
                            />
                        </div>
                    );
                })}
            </div>
            {selectedIndex !== -1 && (
                <GalleryModal items={images} onBackClick={onBackClick} startIndex={selectedIndex} />
            )}
        </>
    );
};

export default Gallery;
