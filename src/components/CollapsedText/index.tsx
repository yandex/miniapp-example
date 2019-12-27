import React, { useEffect, useRef, useState } from 'react';

import ClearButton from '../ClearButton';

import styles from './styles.module.css';

export type ContentProps = {
    className?: string;
    lines: number;
    fullTextLabel: string;
};

const CollapsedText: React.FC<ContentProps> = props => {
    const shortRef = useRef<HTMLDivElement | null>(null);
    const fullRef = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!shortRef.current || !fullRef.current) {
            return;
        }

        const shortRect = shortRef.current.getBoundingClientRect();
        const fullRect = fullRef.current.getBoundingClientRect();

        if (shortRect.height === fullRect.height) {
            setVisible(true);
        }
    }, [shortRef, fullRef, props.lines]);

    return (
        <>
            {!visible && (
                <div
                    ref={shortRef}
                    className={[props.className, styles.short].filter(Boolean).join(' ')}
                    style={{ WebkitLineClamp: props.lines }}
                >
                    {props.children}
                </div>
            )}
            <div className={[props.className, !visible && styles.hidden].filter(Boolean).join(' ')} ref={fullRef}>
                {props.children}
            </div>
            {!visible && (
                <ClearButton className={styles.button} onClick={() => setVisible(true)}>
                    {props.fullTextLabel}
                </ClearButton>
            )}
        </>
    );
};

export default CollapsedText;
