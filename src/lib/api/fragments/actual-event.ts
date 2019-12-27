import { EventPreview } from './event-preview';

export type ActualEvent = {
    eventPreview: EventPreview;
    scheduleInfo: {
        placesTotal: number | null;
        preview: {
            singleDate: {
                day: string;
                month: string;
            } | null;
        } | null;
    };
};
