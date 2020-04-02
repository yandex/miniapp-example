import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { throttle } from 'throttle-debounce';

import { loadPopularEvents, loadSearchResults, resetResults } from '../../redux/slices/search';

import BackwardButton from '../../components/BackwardButton';

import SuggestInput from './Input';
import SearchResult from './SearchResult';
import PopularResult from './PopularResult';

import styles from './styles.module.css';

const INPUT_THROTTLE = 500;

const SearchScreen: React.FC = () => {
    const [hasQuery, setHasQuery] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadPopularEvents());
    }, [dispatch]);

    const onInputChange = useMemo(() => {
        return throttle(INPUT_THROTTLE, (text: string) => {
            text = text.trim();

            setHasQuery(Boolean(text));

            if (!text) {
                dispatch(resetResults());
                return;
            }

            dispatch(loadSearchResults(text));
        });
    }, [dispatch]);

    const onSearchClose = useCallback(() => {
        dispatch(resetResults());
    }, [dispatch]);

    return (
        <>
            <div className={styles.header}>
                <BackwardButton fill={'black'} />
                <SuggestInput onChange={onInputChange} />
            </div>
            <div className={styles.content}>
                {hasQuery ? (
                    <SearchResult onItemClick={onSearchClose} />
                ) : (
                    <PopularResult onLinkClick={onSearchClose} />
                )}
            </div>
        </>
    );
};

export default SearchScreen;
