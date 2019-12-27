import { Ticket } from './ticket';
import { Tag } from './tag-preview';
import { MediaImageSize } from './image-size';

export type EventPreview = {
    id: string;
    title: string;
    argument: string | null;
    type: Tag;
    tags: Tag[];
    contentRating: string | null;
    tickets: Ticket[] | null;
    userRating: {
        overall: {
            count: number;
            value: number;
        };
    } | null;
    image: {
        bgColor: string | null;
        eventListCard: MediaImageSize;
        eventListCard2x: MediaImageSize;
        actualListCard: MediaImageSize;
        actualListCard2x: MediaImageSize;
        selectionCard: MediaImageSize;
    } | null;
};
