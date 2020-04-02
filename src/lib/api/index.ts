import { getDistanceBetweenPoints } from '../geolocation';
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

type QueryParams = {
    [key: string]: string | number | string[] | undefined;
};

function queryParams(params: QueryParams) {
    return Object.keys(params)
        .map(k => {
            const encodeKey = encodeURIComponent(k);

            if (Array.isArray(params[k])) {
                return (params[k] as string[]).map(v => `${encodeKey}=${encodeURIComponent(v)}`).join('&');
            }

            return `${encodeKey}=${encodeURIComponent(params[k]!.toString())}`;
        })
        .join('&');
}

async function request<T extends object>(url: string, query?: QueryParams, signal?: AbortSignal): Promise<T> {
    const response = await fetch(
        [process.env.REACT_APP_API_HOST, url, query ? '?' + queryParams(query) : ''].join(''),
        { signal }
    );

    if (response.ok) {
        return response.json();
    }

    return Promise.reject(response);
}

export function fetchEvent(id: string) {
    return request<EventResponse>(`/api/event/${id}.json`);
}

export function fetchRubricEvents(tag: string, options?: GetEventsOptions) {
    return request<RubricEventsResponse>(`/api/rubric-events/${tag}.json`, options);
}

export function fetchActualEvents(options?: GetEventsOptions) {
    return request<ActualEventsResponse>('/api/actual-events.json', options);
}

export function fetchSelections(options?: GetSelectionsOptions) {
    return request<SelectionsResponse>('/api/selections.json', options);
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
    return request<CityListResponse>('/api/city-list.json');
}

export function fetchSelectionEvents(code: string, options?: GetEventsOptions) {
    return request<SelectionEventsResponse>(`/api/selection-events/${code}.json`, options);
}

export function fetchSuggest(text: string, geoid: number, signal: AbortSignal) {
    return request<SuggestResponse>('/api/suggest.json', { text, geoid }, signal);
}

export function fetchRecommendedEvents(options?: GetEventsOptions) {
    return request<RecommendedEventsResponse>('/api/recommended-events.json', options);
}
