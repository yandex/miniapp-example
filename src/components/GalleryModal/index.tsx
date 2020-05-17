import React, { useState, useEffect, useRef, MouseEvent, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

import { GalleryImage } from '../../lib/api/fragments/gallery-image';

import Image from '../Image';

import styles from './styles.module.css';

type Props = {
    items: GalleryImage[];
    onBackClick: (e: MouseEvent<HTMLButtonElement>) => void;
    startIndex?: number;
};

// Можно попробовать pinch-zoom
// https://github.com/GoogleChromeLabs/pinch-zoom

const GalleryModal: React.FC<Props> = props => {
    const [currentIndex, setCurrentIndex] = useState(props.startIndex || 0);
    const scroller = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        if (!props.startIndex) {
            return;
        }

        scroller.current!.scrollLeft = getScrollPosition(props.startIndex);
    }, [props.startIndex]);

    useEffect(() => {
        const rootEl = scroller.current!;

        const observer = new IntersectionObserver(
            entries => {
                // find the entry with the largest intersection ratio
                const activated = entries.reduce((max, entry) => {
                    return entry.intersectionRatio > max.intersectionRatio ? entry : max;
                });

                if (activated.intersectionRatio > 0) {
                    const el = activated.target;
                    const index = Array.prototype.indexOf.call(el.parentElement!.children, el);

                    setCurrentIndex(index);
                }
            },
            {
                root: scroller.current,
                threshold: 0.5,
            }
        );

        for (const el of Array.from(rootEl.children)) {
            observer.observe(el);
        }

        return () => {
            observer.disconnect();
        };
    }, [props.items, props.startIndex]);

    return createPortal(
        <div className={styles.modal}>
            <div className={styles.counter}>
                {currentIndex + 1} из {props.items.length}
            </div>
            <button className={styles.close} onClick={props.onBackClick}>
                Назад
            </button>

            <div className={styles.carousel} ref={scroller}>
                {props.items.map((image, i) => {
                    return (
                        <div className={styles.image} key={image.large2x.url}>
                            <Image
                                src={image.large}
                                src2x={image.large2x}
                                bgColor={image.bgColor}
                                alt={`Фотография ${i + 1}`}
                            />
                        </div>
                    );
                })}
            </div>
        </div>,
        document.body
    );
};

function getScrollPosition(index: number) {
    const itemsMargin = 20;

    return (window.innerWidth + itemsMargin) * index;
}

export default GalleryModal;
