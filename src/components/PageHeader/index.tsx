import React, { memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';

import { setVisible as setMenuVisible } from '../../redux/slices/menu';
import { getMainPageUrl, getSearchUrl } from '../../lib/url-builder';

import BackwardButton from '../BackwardButton';
import ClearButton from '../ClearButton';

import styles from './styles.module.css';

const Logo: React.FC = () => (
    <Link to={getMainPageUrl()} className={styles.logo}>
        MiniApp Example
    </Link>
);

type IconProps = {
    fill?: 'white' | 'black';
};

const SuggestIcon: React.FC<IconProps> = ({ fill = 'black' }) => {
    const className = [styles['suggest-icon'], styles[`icon-${fill}`]].join(' ');

    return <span className={className} />;
};

function setMods(className: string, mods?: string) {
    if (!mods) {
        return styles[className];
    }

    return `${styles[className]} ${styles[`${className}_${mods}`]}`;
}

export type Props = {
    hasMenu?: boolean;
    hasLogo?: boolean;
    backward?: 'white' | 'black' | '';
    mods?: 'clear' | '';
    text?: string;
};

const PageHeader: React.FC<Props> = props => {
    const { hasMenu, hasLogo, backward, mods, text } = props;

    const history = useHistory();
    const dispatch = useDispatch();

    const onSearchClick = useCallback(() => {
        history.push(getSearchUrl());
    }, [history]);

    const onMenuClick = useCallback(() => {
        dispatch(setMenuVisible(true));
    }, [dispatch]);

    return (
        <header className={setMods('page-header', mods)}>
            {Boolean(backward) && <BackwardButton className={styles['backward-button']} fill={backward || 'black'} />}
            {Boolean(hasMenu) && (
                <ClearButton className={styles['menu-button']} onClick={onMenuClick}>
                    <span className={styles['burger-menu-icon']} />
                </ClearButton>
            )}
            {hasLogo && <Logo />}
            {text && <span className={styles.text}>{text}</span>}
            <ClearButton className={styles['suggest-button']} onClick={onSearchClick}>
                <SuggestIcon fill={mods ? 'white' : 'black'} />
            </ClearButton>
        </header>
    );
};

export default memo(PageHeader);
