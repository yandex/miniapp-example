import { MediaImageSize } from './image-size';
import { Currency } from './ticket';

export type Document = {
    object: {
        objectType: 'SearchObjectEvent';
        id: string;
        title: string;
        argument: string | null;
        minPrice: {
            currency: Currency;
            value: number;
        } | null;
        type: {
            code: string;
            name: string;
        };
        image: {
            bgColor: string | null;
            eventListCard: MediaImageSize;
            eventListCard2x: MediaImageSize;
            actualListCard: MediaImageSize;
            actualListCard2x: MediaImageSize;
            selectionCard: MediaImageSize;
        } | null;
    };
};

export type Groups = {
    code: string;
    title: string | null;
    documents: Document[];
};

export type Suggest = {
    groups: Groups[];
};
