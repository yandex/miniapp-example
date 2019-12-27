import React from 'react';

import Button from '../ClearButton';
import { useBackward } from '../StackNavigator/hooks';

import styles from './styles.module.css';

type Props = {
    fill?: 'white' | 'black';
    className?: string;
};

const BackwardIcon: React.FC<Props> = ({ fill = 'white' }) => {
    const classNames = [styles['backward-icon'], styles[`icon-${fill}`]].join(' ');

    return <span className={classNames} />;
};

const Backward: React.FC<Props> = props => {
    const onClick = useBackward();

    return (
        <Button className={[styles['backward-button'], props.className].filter(Boolean).join(' ')} onClick={onClick}>
            <BackwardIcon fill={props.fill} />
        </Button>
    );
};

export default Backward;
