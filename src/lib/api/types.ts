import { ActualEvents } from './fragments/actual-events';
import { EventData } from './fragments/event';
import { ActualEvent } from './fragments/actual-event';
import { City } from './fragments/city';
import { Suggest } from './fragments/suggest';

export type RubricEventsResponse = {
    title: string;
    events: ActualEvents;
};

export type ActualEventsResponse = {
    events: ActualEvents;
};

export type EventResponse = EventData;

export type SelectionsResponse = {
    selections: Array<{
        code: string;
        title: string;
        count: number;
        events: Array<ActualEvent | null>;
    } | null>;
};

export type SelectionEventsResponse = {
    title: string;
    events: ActualEvents;
};

export type CityInfoResponse = {
    cityInfo: City;
};

export type CityListResponse = {
    cities: City[];
};

export type SuggestResponse = {
    suggest: Suggest;
};

enum Places {
    Top = 'top',
    Cinema = 'cinema',
    Concert = 'concert',
    Theatre = 'theatre',
}

export type RecommendedEventsResponse = {
    [Places.Top]?: ActualEvents;
    [Places.Cinema]?: ActualEvents;
    [Places.Concert]?: ActualEvents;
    [Places.Theatre]?: ActualEvents;
};

export type UserInfo = {
    name: string;
    email: string;
    phone: string;
};

export type CreateOrderResponse = {
    paymentToken: string;
    id: number;
    cost: number;
};

export enum PaymentStatus {
    New = 'new',
    InModeration = 'in_moderation',
    Held = 'held',
    InProgress = 'in_progress',
    ModerationNegative = 'moderation_negative',
    InCancel = 'in_cancel',
    Canceled = 'canceled',
    Rejected = 'rejected',
    Paid = 'paid',
}

export type OrderResponse = {
    id: number;
    status: PaymentStatus;
    apiResponseStatus: 'success' | 'fail';
    cost: number;
    event: {
        id: string;
        title: string;
    }
}
