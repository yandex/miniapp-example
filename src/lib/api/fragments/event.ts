import { EventScheduleInfo } from './event-schedule-info';
import { GalleryImage } from './gallery-image';
import { TouchPrimaryImage } from './event-main-image';
import { Ticket } from './ticket';

export type Event = {
    id: string;
    title: string;
    argument: string | null;
    contentRating: string | null;
    description: string | null;
    tags: {
        name: string;
        code: string;
    }[];
    image: TouchPrimaryImage | null;
    images: Array<GalleryImage | null> | null;
    type: {
        name: string;
    };
    userRating: {
        overall: {
            count: number;
            value: number;
        };
    } | null;
    tickets: Array<Ticket | null> | null;
};

export type EventData = {
    event: Event;
    scheduleInfo: EventScheduleInfo;
};
