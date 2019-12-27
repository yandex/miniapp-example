import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer, createTransform } from 'redux-persist';

import { fetchActualEvents, fetchSuggest } from '../../lib/api';

import { Document, Groups } from '../../lib/api/fragments/suggest';
import { ActualEvent } from '../../lib/api/fragments/actual-event';
import { AppThunk } from '../index';
import { getPersistConfig, getTransformUIPersistance } from '../helpers/persist';

type SearchState = {
    data: {
        results: {
            groups: Array<{
                code: string;
                title: string | null;
                events: ActualEvent[];
            }>;
        };
        popularEvents: {
            events: Array<ActualEvent | null>;

            updatedAt: number;
        };
    };
    ui: {
        results: { isLoading: boolean };
        popularEvents: { isLoading: boolean; isUpdating: boolean };
    };
};

const initialState: SearchState = {
    data: {
        results: {
            groups: [],
        },
        popularEvents: {
            events: [],
            updatedAt: 0,
        },
    },
    ui: {
        popularEvents: {
            isLoading: false,
            isUpdating: false,
        },
        results: { isLoading: false },
    },
};

const updateInterval = 900 * 1000;

const search = createSlice({
    name: 'search',
    initialState,
    reducers: {
        fetchPopularStart(state) {
            if (state.data.popularEvents.events.length > 0) {
                state.ui.popularEvents.isUpdating = true;
            } else {
                state.ui.popularEvents.isLoading = true;
            }
        },
        fetchPopularSuccess(state, action: PayloadAction<SearchState['data']['popularEvents']['events']>) {
            state.data.popularEvents.events = action.payload;
            state.data.popularEvents.updatedAt = Date.now();
            state.ui.popularEvents.isLoading = false;
            state.ui.popularEvents.isUpdating = false;
        },
        fetchPopularError(state) {
            state.ui.popularEvents.isLoading = false;
            state.ui.popularEvents.isUpdating = false;
        },
        searchStart(state) {
            state.ui.results.isLoading = true;
            state.data.results.groups = [];
        },
        searchSuccess(state, action: PayloadAction<Groups[]>) {
            state.ui.results.isLoading = false;
            state.data.results.groups = action.payload.map(group => {
                return {
                    code: group.code,
                    title: group.title,
                    events: group.documents.map(doc => transformSearchDocumentToList(doc)),
                };
            });
        },
        searchError(state) {
            state.ui.results.isLoading = false;
        },
        resetResults(state) {
            if (state.data.results.groups.length > 0) {
                state.data.results.groups = [];
            }
        },
    },
});

export const {
    fetchPopularStart,
    fetchPopularSuccess,
    fetchPopularError,
    searchStart,
    searchSuccess,
    searchError,
    resetResults,
} = search.actions;

export const loadPopularEvents = (): AppThunk => async(dispatch, getState) => {
    const events = getState().search.data.popularEvents;

    if (events && events.updatedAt + updateInterval > Date.now()) {
        return;
    }

    dispatch(fetchPopularStart());

    try {
        const { geoid } = getState().city.currentCity;
        const actualEvents = await fetchActualEvents({ limit: 15, geoid });
        dispatch(fetchPopularSuccess(actualEvents.events.items));
    } catch (err) {
        console.error({ err });
        dispatch(fetchPopularError());
    }
};

let activeRequest: AbortController | null = null;

function filterGroupsByText(text: string, groups: Groups[]) {
    return groups
        .map<Groups>(group => ({
            ...group,
            documents: group.documents.filter(({ object }) =>
                object.title.toLowerCase().includes(text.trim().toLowerCase())
            ),
        }))
        .filter(group => group.documents.length);
}
export const loadSearchResults = (text: string): AppThunk => async(dispatch, getState) => {
    if (activeRequest) {
        activeRequest.abort();
    }

    activeRequest = new AbortController();

    // Избегаем лишней перерисовки при наборе запроса
    if (!getState().search.ui.results.isLoading) {
        dispatch(searchStart());
    }

    try {
        const { geoid } = getState().city.currentCity;
        const {
            suggest: { groups },
        } = await fetchSuggest(text, geoid, activeRequest.signal);

        dispatch(searchSuccess(filterGroupsByText(text, groups)));

        activeRequest = null;
    } catch (err) {
        if (err.name === 'AbortError') {
            return;
        }

        console.error({ err });
        dispatch(searchError());
    }
};

const persistConfig = getPersistConfig<SearchState>('search', {
    transforms: [
        createTransform(
            (inboundState: SearchState[keyof SearchState], key: keyof SearchState): SearchState[keyof SearchState] => {
                if (key === 'data') {
                    const { results, ...rest } = inboundState as SearchState['data'];

                    return { ...rest, results: { groups: [] } };
                }

                return inboundState;
            }
        ),
        getTransformUIPersistance<SearchState['ui']>(initialState.ui),
    ],
});
export default persistReducer(persistConfig, search.reducer);

export function transformSearchDocumentToList(document: Document): ActualEvent {
    const { id, title, argument, image, type, minPrice } = document.object;

    return {
        eventPreview: {
            id,
            title,
            argument,
            image,
            type,
            tags: [],
            contentRating: null,
            tickets: minPrice ?
                [
                    {
                        id: null,
                        price: { min: minPrice.value, currency: minPrice.currency, max: null },
                    },
                ] :
                [],
            userRating: null,
        },
        scheduleInfo: {
            placesTotal: null,
            preview: null,
        },
    };
}
