import { format, parse } from 'date-fns';

export const dateToString = (date: Date) => format(date, 'YYYY-MM-DD').toString();
export const parseDate = (date: string) => parse(date);
