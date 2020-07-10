import { getDistanceBetweenPoints } from '../geolocation';
import { get, post } from './request';
import {
    RubricEventsResponse,
    ActualEventsResponse,
    EventResponse,
    SelectionsResponse,
    SelectionEventsResponse,
    CityInfoResponse,
    CityListResponse,
    SuggestResponse,
    RecommendedEventsResponse,
    CreateOrderResponse,
    OrderResponse,
    UserInfo,
} from './types';
import { City } from './fragments/city';

export const MOSCOW = {
    name: 'Москва',
    geoid: 213,
    longitude: 37.611347,
    latitude: 55.760241,
} as const;

type DateFilter = {
    date: string;
    period: number;
};

export type GetEventsOptions = {
    geoid: number;
    offset?: number;
    limit?: number;
} & Partial<DateFilter>;

type GetCityInfoOptions = {
    longitude: number;
    latitude: number;
};

export type GetSelectionsOptions = DateFilter & { geoid: number };

const API_HOST = process.env.REACT_APP_API_HOST ?? '';
const PAYMENT_API_HOST = process.env.REACT_APP_PAYMENT_API_HOST ?? '';

export function fetchEvent(id: string) {
    return get<EventResponse>(API_HOST, `/api/event/${id}.json`);
}

export function fetchRubricEvents(tag: string, options?: GetEventsOptions) {
    return get<RubricEventsResponse>(API_HOST, `/api/rubric-events/${tag}.json`, options);
}

export function fetchActualEvents(options?: GetEventsOptions) {
    return get<ActualEventsResponse>(API_HOST, '/api/actual-events.json', options);
}

export function fetchSelections(options?: GetSelectionsOptions) {
    return get<SelectionsResponse>(API_HOST, '/api/selections.json', options);
}

export async function fetchCityInfo(options: GetCityInfoOptions): Promise<CityInfoResponse> {
    const cityList = await fetchCityList();

    const citiesWithDistance = cityList.cities.map(city => {
        const distance = getDistanceBetweenPoints(options.latitude, options.longitude, city.latitude, city.longitude);

        return {
            ...city,
            distance,
        };
    });

    let minDistance = Infinity;

    const nearestCity: City = citiesWithDistance.reduce<City>(
        (nearestCity, city) => {
            if (city.distance < minDistance) {
                minDistance = city.distance;

                delete city.distance;

                return city;
            }

            return nearestCity;
        },
        {
            ...MOSCOW,
            eventsMenu: [],
        }
    );

    return {
        cityInfo: nearestCity,
    };
}

export function fetchCityList() {
    return get<CityListResponse>(API_HOST, '/api/city-list.json');
}

export function fetchSelectionEvents(code: string, options?: GetEventsOptions) {
    return get<SelectionEventsResponse>(API_HOST, `/api/selection-events/${code}.json`, options);
}

export function fetchSuggest(text: string, geoid: number, signal: AbortSignal) {
    return get<SuggestResponse>(API_HOST, '/api/suggest.json', { text, geoid }, { signal });
}

export function fetchRecommendedEvents(options?: GetEventsOptions) {
    return get<RecommendedEventsResponse>(API_HOST, '/api/recommended-events.json', options);
}

export type OrderData = {
    eventId: string;
    amount: number;
};
export function createOrder(orderData: OrderData, jwtToken: string) {
    return post<CreateOrderResponse>(PAYMENT_API_HOST, '/payment', {
        headers: {
            Authorization: jwtToken,
        },
        body: JSON.stringify(orderData),
    });
}

export type OrderUserInfo = {
    userInfo: UserInfo;
    paymentId: number;
    pushToken?: string;
};
export function saveUserInfo(orderUserInfo: OrderUserInfo, jwtToken: string) {
    return post(PAYMENT_API_HOST, '/payment/user-info', {
        headers: {
            Authorization: jwtToken,
        },
        body: JSON.stringify(orderUserInfo),
    });
}

export function fetchOrdersHistory(jwtToken: string) {
    return get<OrderResponse[]>(PAYMENT_API_HOST, '/payments', undefined, {
        headers: {
            Authorization: jwtToken,
        },
    });
}
