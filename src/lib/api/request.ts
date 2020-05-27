type QueryParams = {
    [key: string]: string | number | string[] | undefined;
};

type RetryOptions = {
    retryCount: number,
    retryDelay: number,
};

const defaultRetryOptions: RetryOptions = {
    retryCount: 2,
    retryDelay: 2000,
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

async function fetchRetry(url: string, init?: RequestInit, retryOptions: RetryOptions = defaultRetryOptions) {
    const { retryCount, retryDelay } = retryOptions;

    for (let attempt = 0; attempt <= Math.max(retryCount, 0); attempt++) {
        try {
            return await fetch(url, init);
        } catch (err) {
            if (attempt === retryCount) {
                throw err;
            }

            if (retryDelay) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }

    return Promise.reject('Unable to fetch. Check retryOptions values');
}

async function request<T extends object>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetchRetry(
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
    options?: RequestInit
): Promise<T> {
    return request(`${host}${path}${queryParams(query) ? `?${queryParams(query)}` : ''}`, options);
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
