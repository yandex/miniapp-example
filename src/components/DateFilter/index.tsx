import React, { memo, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isTomorrow, startOfToday, startOfTomorrow } from 'date-fns';

import { RootState } from '../../redux';
import { setDate } from '../../redux/slices/date-filter';
import { parseDate, dateToString } from '../../lib/date';

import DateFilterButton from './Button';
import styles from './styles.module.css';

export enum Presets {
    Today = 'Today',
    Tomorrow = 'Tomorrow',
}

const DateFilter: React.FC = () => {
    const dispatch = useDispatch();
    const { date } = useSelector((state: RootState) => state.dateFilter);
    const parsedDate = useMemo(() => parseDate(date), [date]);
    const [preset, setPreset] = useState(getPresetByDate(parsedDate));

    const setTodayPreset = useCallback(() => {
        setPreset(Presets.Today);

        dispatch(
            setDate({
                date: dateToString(startOfToday()),
                period: 1,
            })
        );
    }, [dispatch]);

    const setTomorrowPreset = useCallback(() => {
        setPreset(Presets.Tomorrow);

        dispatch(
            setDate({
                date: dateToString(startOfTomorrow()),
                period: 1,
            })
        );
    }, [dispatch]);

    return (
        <div className={styles.container}>
            <DateFilterButton onClick={setTodayPreset} isActive={preset === Presets.Today}>
                Сегодня
            </DateFilterButton>
            <DateFilterButton onClick={setTomorrowPreset} isActive={preset === Presets.Tomorrow}>
                Завтра
            </DateFilterButton>
        </div>
    );
};

function getPresetByDate(date: Date) {
    if (isTomorrow(date)) {
        return Presets.Tomorrow;
    }

    return Presets.Today;
}

export default memo(DateFilter);
