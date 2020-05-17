type QueryParams = {
    [key: string]: string | number | string[] | undefined;
};

function queryParams(params?: QueryParams) {
    if (!params) {
        return '';
    }

    const result = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (typeof value === 'undefined') {
            return;
        }

        if (Array.isArray(value)) {
            return value.forEach(valueItem => result.append(key, valueItem));
        }

        result.append(key, value.toString());
    });

    return result.toString();
}

async function request<T extends object>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(
        url,
        options
    );

    if (response.ok) {
        return response.json();
    }

    return Promise.reject(response);
}

export async function get<T extends object>(
    host: string,
    path: string,
    query?: QueryParams,
    signal?: AbortSignal
): Promise<T> {
    return request(`${host}${path}${queryParams(query) ? `?${queryParams(query)}` : ''}`, { signal });
}

export async function post<T extends object>(host: string, path: string, options: RequestInit): Promise<T> {
    return request(`${host}${path}`, {
        ...options,
        method: 'POST',
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
        }
    });
}
