import { PlacePreview } from './place-preview';
import { SchedulePreview } from './schedule-preview';

export type EventScheduleInfo = {
    oneOfPlaces: PlacePreview | null;
    placePreview: string | null;
    preview: SchedulePreview | null;
};
