import React, { useCallback, useState } from 'react';

import { MediaImageSize } from '../../lib/api/fragments/image-size';

import styles from './styles.module.css';

const emptyImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';

export type ImageProps = {
    className?: string;
    src?: MediaImageSize | null;
    src2x?: MediaImageSize | null;
    bgColor?: string | null;
    alt?: string;
};

const Image: React.FC<ImageProps> = props => {
    const color = props.bgColor || '#555';
    const [isLoaded, setLoaded] = useState(false);

    const onLoad = useCallback(() => {
        if (props.src) {
            setLoaded(true);
        }
    }, [setLoaded, props.src]);
    const stubClassNames = [styles.stub, isLoaded && styles['stub-hidden']].filter(Boolean).join(' ');
    const containerClassNames = [props.className, styles.container].filter(Boolean).join(' ');

    return (
        <div className={containerClassNames}>
            <img
                className={styles.image}
                onLoad={onLoad}
                src={props.src ? props.src.url : emptyImage}
                srcSet={props.src2x ? `${props.src2x.url} 2x` : undefined}
                alt={props.alt}
            />
            <div className={stubClassNames} style={{ backgroundColor: color }} />
        </div>
    );
};

export default Image;
