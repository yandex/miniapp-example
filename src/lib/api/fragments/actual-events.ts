import { EventData } from './event';
import { Paging } from './paging';
import { ActualEvent } from './actual-event';

export type ActualEvents = {
    items: Array<ActualEvent | null>;
    paging: Paging;
    prefetchItems?: Array<EventData>;
};
